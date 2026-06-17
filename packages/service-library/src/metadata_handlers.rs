//! Library metadata refresh, backed by sqlx + the v2 schema.
//!
//! Orchestrates manual, IGDB, and Steam metadata for every platform and game in the
//! database. IGDB and Steam lookups are delegated to the metadata service via the gRPC
//! clients carried on [`LibraryServiceHandlers`] (`igdb_svc_client`, `steam_svc_client`);
//! all persistence is performed locally with [`sqlx::QueryBuilder`].

use super::LibraryServiceHandlers;
use retrom_codegen::retrom::{
    providers::igdb::v1::{
        igdb_fields::{IncludeFields, Selector as FieldSelector},
        igdb_filters::{FilterOperator, FilterValue},
        IgdbFields, IgdbFilters, IgdbPagination, IgdbSearch,
    },
    services::{
        jobs::v1::JobStatus,
        library::v1::{UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse},
        metadata::v1::{
            igdb_service_client::IgdbServiceClient, steam_service_client::SteamServiceClient,
            sync_steam_metadata_request::Selector, GameMetadata, GetIgdbGameMetadataRequest,
            GetIgdbPlatformMetadataRequest, IgdbSearchRequest, ListIgdbPlatformMetadataRequest,
            PlatformMetadata, SearchIgdbGamesRequest, SearchIgdbPlatformsRequest,
            SyncSteamMetadataRequest,
        },
    },
};
use retrom_db::{DbPool, RetromDB};
use retrom_service_common::metadata_providers::igdb::provider::{
    default_game_fields, default_platform_fields, IGDB_PROVIDER_ID,
};
use retrom_service_jobs::job_manager::JobManager;
use sqlx::QueryBuilder;
use std::{collections::HashMap, path::Path, sync::Arc};
use tonic::{transport::Channel, Status};
use tracing::{error, instrument, warn};

const MANUAL_PROVIDER_ID: &str = "00000000-0000-0000-0000-000000000001";
const GENRE_DOMAIN: &str = "genre";
const FRANCHISE_DOMAIN: &str = "franchise";
const FAMILY_DOMAIN: &str = "family";

#[instrument(skip(state))]
pub async fn update_metadata(
    state: &LibraryServiceHandlers,
    request: UpdateLibraryMetadataRequest,
) -> Result<UpdateLibraryMetadataResponse, Status> {
    let overwrite = request.overwrite.unwrap_or(false);
    let db_pool = state.db_pool.clone();

    let has_steam_games = count_steam_games(&db_pool)
        .await
        .map_err(|why| Status::internal(why.to_string()))?
        > 0;

    let job_manager = state.job_manager.clone();

    let platform_job = job_manager
        .create_job(
            "Downloading Platform Metadata".to_string(),
            "Pending".to_string(),
        )
        .await;
    let game_job = job_manager
        .create_job(
            "Downloading Game Metadata".to_string(),
            "Pending".to_string(),
        )
        .await;
    let extra_job = job_manager
        .create_job(
            "Downloading Extra Metadata".to_string(),
            "Pending".to_string(),
        )
        .await;
    let steam_job = if has_steam_games {
        Some(
            job_manager
                .create_job(
                    "Downloading Steam Metadata".to_string(),
                    "Pending".to_string(),
                )
                .await,
        )
    } else {
        None
    };

    let platform_job_id = platform_job.id.clone();
    let game_job_id = game_job.id.clone();
    let extra_job_id = extra_job.id.clone();
    let steam_job_id = steam_job.as_ref().map(|job| job.id.clone());

    let igdb_client = state.igdb_svc_client.clone();
    let steam_client = state.steam_svc_client.clone();

    let task_platform_id = platform_job_id.clone();
    let task_game_id = game_job_id.clone();
    let task_extra_id = extra_job_id.clone();
    let task_steam_id = steam_job_id.clone();

    tokio::spawn(async move {
        run_platform_phase(
            &db_pool,
            igdb_client.clone(),
            overwrite,
            &job_manager,
            &task_platform_id,
        )
        .await;

        run_game_phase(
            &db_pool,
            igdb_client,
            overwrite,
            &job_manager,
            &task_game_id,
        )
        .await;

        if let Some(steam_job_id) = task_steam_id {
            run_steam_phase(&db_pool, steam_client, &job_manager, &steam_job_id).await;
        }

        run_similar_phase(&db_pool, &job_manager, &task_extra_id).await;
    });

    Ok(UpdateLibraryMetadataResponse {
        platform_metadata_job_id: platform_job_id,
        game_metadata_job_id: game_job_id,
        extra_metadata_job_id: extra_job_id,
        steam_metadata_job_id: steam_job_id,
    })
}

struct PlatformRow {
    id: String,
    name: String,
}

struct GameRow {
    id: String,
    name: String,
    platform_id: Option<String>,
}

async fn count_steam_games(db_pool: &DbPool) -> Result<i64, sqlx::Error> {
    let mut builder = QueryBuilder::new(
        "select count(*) from games where steam_app_id is not null and is_deleted = ",
    );
    builder.push_bind(false);

    builder.build_query_scalar().fetch_one(db_pool).await
}

async fn load_platforms(db_pool: &DbPool) -> Result<Vec<PlatformRow>, sqlx::Error> {
    let rows: Vec<(String, String)> = QueryBuilder::new(
        "select p.id, rd.path from platforms p \
         join platform_root_directories prd on prd.platform_id = p.id \
         join root_directories rd on rd.id = prd.root_directory_id \
         where p.is_deleted = false and p.third_party = false",
    )
    .build_query_as()
    .fetch_all(db_pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|(id, path)| PlatformRow {
            id,
            name: basename(&path),
        })
        .collect())
}

async fn load_games(db_pool: &DbPool) -> Result<Vec<GameRow>, sqlx::Error> {
    let rows: Vec<(String, String, Option<String>)> = QueryBuilder::new(
        "select g.id, rd.path, gp.platform_id from games g \
             join game_root_directories grd on grd.game_id = g.id \
             join root_directories rd on rd.id = grd.root_directory_id \
             left join game_platforms gp on gp.game_id = g.id \
             where g.is_deleted = false and g.third_party = false",
    )
    .build_query_as()
    .fetch_all(db_pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|(id, path, platform_id)| GameRow {
            id,
            name: basename(&path),
            platform_id,
        })
        .collect())
}

fn basename(path: &str) -> String {
    Path::new(path)
        .file_stem()
        .and_then(|stem| stem.to_str())
        .map(|stem| stem.to_string())
        .unwrap_or_else(|| path.to_string())
}

async fn run_platform_phase(
    db_pool: &DbPool,
    mut igdb_client: IgdbServiceClient<Channel>,
    overwrite: bool,
    job_manager: &Arc<JobManager>,
    job_id: &str,
) {
    let _ = job_manager
        .update_job(
            job_id,
            Some(0.0),
            Some(JobStatus::Running),
            Some("Refreshing platform metadata".to_string()),
        )
        .await;

    let platforms = match load_platforms(db_pool).await {
        Ok(platforms) => platforms,
        Err(why) => {
            error!("Failed to load platforms: {}", why);
            let _ = job_manager
                .complete_job(job_id, true, "Failed to load platforms".to_string())
                .await;
            return;
        }
    };

    let total = platforms.len();
    let mut failed = false;

    for (index, platform) in platforms.iter().enumerate() {
        if let Err(why) = refresh_platform(db_pool, &mut igdb_client, platform, overwrite).await {
            warn!("Failed to refresh platform {}: {}", platform.id, why);
            failed = true;
        }

        report_progress(job_manager, job_id, index + 1, total).await;
    }

    finish_job(job_manager, job_id, failed, "Platform metadata").await;
}

async fn refresh_platform(
    db_pool: &DbPool,
    igdb_client: &mut IgdbServiceClient<Channel>,
    platform: &PlatformRow,
    overwrite: bool,
) -> Result<(), String> {
    if metadata_exists(
        db_pool,
        "platform_metadata",
        "platform_id",
        &platform.id,
        MANUAL_PROVIDER_ID,
    )
    .await
    .map_err(|why| why.to_string())?
    .is_none()
    {
        let manual = PlatformMetadata {
            platform_id: platform.id.clone(),
            provider_id: MANUAL_PROVIDER_ID.to_string(),
            name: Some(platform.name.clone()),
            ..Default::default()
        };

        upsert_platform_metadata(db_pool, manual)
            .await
            .map_err(|why| why.to_string())?;
    }

    let existing_igdb_meta_id = metadata_exists(
        db_pool,
        "platform_metadata",
        "platform_id",
        &platform.id,
        IGDB_PROVIDER_ID,
    )
    .await
    .map_err(|why| why.to_string())?;

    if existing_igdb_meta_id.is_some() && !overwrite {
        return Ok(());
    }

    let response = igdb_client
        .get_igdb_platform_metadata(GetIgdbPlatformMetadataRequest {
            platform_id: platform.id.clone(),
            search: None,
        })
        .await
        .map_err(|why| why.to_string())?
        .into_inner();

    let Some(metadata) = response.platform_metadata else {
        return Ok(());
    };

    upsert_platform_metadata(db_pool, metadata)
        .await
        .map_err(|why| why.to_string())?;

    Ok(())
}

async fn run_game_phase(
    db_pool: &DbPool,
    mut igdb_client: IgdbServiceClient<Channel>,
    overwrite: bool,
    job_manager: &Arc<JobManager>,
    job_id: &str,
) {
    let _ = job_manager
        .update_job(
            job_id,
            Some(0.0),
            Some(JobStatus::Running),
            Some("Refreshing game metadata".to_string()),
        )
        .await;

    let games = match load_games(db_pool).await {
        Ok(games) => games,
        Err(why) => {
            error!("Failed to load games: {}", why);
            let _ = job_manager
                .complete_job(job_id, true, "Failed to load games".to_string())
                .await;
            return;
        }
    };

    let total = games.len();
    let mut failed = false;

    for (index, game) in games.iter().enumerate() {
        if let Err(why) = refresh_game(db_pool, &mut igdb_client, game, overwrite).await {
            warn!("Failed to refresh game {}: {}", game.id, why);
            failed = true;
        }

        report_progress(job_manager, job_id, index + 1, total).await;
    }

    finish_job(job_manager, job_id, failed, "Game metadata").await;
}

async fn refresh_game(
    db_pool: &DbPool,
    igdb_client: &mut IgdbServiceClient<Channel>,
    game: &GameRow,
    overwrite: bool,
) -> Result<(), String> {
    if metadata_exists(
        db_pool,
        "game_metadata",
        "game_id",
        &game.id,
        MANUAL_PROVIDER_ID,
    )
    .await
    .map_err(|why| why.to_string())?
    .is_none()
    {
        let manual = GameMetadata {
            game_id: game.id.clone(),
            provider_id: MANUAL_PROVIDER_ID.to_string(),
            name: Some(game.name.clone()),
            ..Default::default()
        };

        upsert_game_metadata(db_pool, manual)
            .await
            .map_err(|why| why.to_string())?;
    }

    let existing_igdb_meta_id = metadata_exists(
        db_pool,
        "game_metadata",
        "game_id",
        &game.id,
        IGDB_PROVIDER_ID,
    )
    .await
    .map_err(|why| why.to_string())?;

    if existing_igdb_meta_id.is_some() && !overwrite {
        return Ok(());
    }

    let platform_igdb_id = match &game.platform_id {
        Some(platform_id) => platform_igdb_id(db_pool, platform_id)
            .await
            .map_err(|why| why.to_string())?,
        None => None,
    };

    let mut filters = HashMap::<String, FilterValue>::new();
    if let Some(id) = existing_igdb_meta_id {
        filters.insert(
            "id".to_string(),
            FilterValue {
                operator: Some(FilterOperator::Equal.into()),
                value: id,
            },
        );
    }

    if let Some(platform) = platform_igdb_id {
        filters.insert(
            "release_dates.platform".to_string(),
            FilterValue {
                operator: Some(FilterOperator::Equal.into()),
                value: platform.to_string(),
            },
        );
    }

    let request = IgdbSearchRequest {
        search: Some(IgdbSearch {
            value: game.name.clone(),
        }),
        pagination: Some(IgdbPagination {
            limit: Some(1),
            offset: None,
        }),
        filters: (!filters.is_empty()).then_some(IgdbFilters { filters }),
        fields: Some(include_fields(default_game_fields())),
    };

    let response = igdb_client
        .get_igdb_game_metadata(GetIgdbGameMetadataRequest {
            game_id: game.id.clone(),
            search: None,
        })
        .await
        .map_err(|why| why.to_string())?
        .into_inner();

    let Some(metadata) = response.game_metadata else {
        return Ok(());
    };

    let metadata_id = upsert_game_metadata(db_pool, metadata)
        .await
        .map_err(|why| why.to_string())?;

    let screenshot_urls: Vec<String> = igdb_game_screenshots(&igdb_game)
        .into_iter()
        .map(|item| item.url)
        .collect();
    let video_urls: Vec<String> = igdb_game_videos(&igdb_game)
        .into_iter()
        .map(|item| item.url)
        .collect();
    let artwork_urls: Vec<String> = igdb_game_artwork(&igdb_game)
        .into_iter()
        .map(|item| item.url)
        .collect();

    replace_media(
        db_pool,
        "game_metadata_screenshots",
        &metadata_id,
        &screenshot_urls,
    )
    .await
    .map_err(|why| why.to_string())?;
    replace_media(db_pool, "game_metadata_videos", &metadata_id, &video_urls)
        .await
        .map_err(|why| why.to_string())?;
    replace_media(
        db_pool,
        "game_metadata_artwork",
        &metadata_id,
        &artwork_urls,
    )
    .await
    .map_err(|why| why.to_string())?;

    let genres: Vec<String> = igdb_game
        .genres
        .iter()
        .map(|genre| genre.name.clone())
        .collect();
    let franchises: Vec<String> = igdb_game
        .franchises
        .iter()
        .map(|franchise| franchise.name.clone())
        .collect();

    apply_game_tags(db_pool, &game.id, GENRE_DOMAIN, &genres)
        .await
        .map_err(|why| why.to_string())?;
    apply_game_tags(db_pool, &game.id, FRANCHISE_DOMAIN, &franchises)
        .await
        .map_err(|why| why.to_string())?;

    Ok(())
}

async fn run_steam_phase(
    db_pool: &DbPool,
    mut steam_client: SteamServiceClient<Channel>,
    job_manager: &Arc<JobManager>,
    job_id: &str,
) {
    let _ = job_manager
        .update_job(
            job_id,
            Some(0.0),
            Some(JobStatus::Running),
            Some("Refreshing Steam metadata".to_string()),
        )
        .await;

    let game_ids: Vec<String> = match steam_game_ids(db_pool).await {
        Ok(ids) => ids,
        Err(why) => {
            error!("Failed to load Steam games: {}", why);
            let _ = job_manager
                .complete_job(job_id, true, "Failed to load Steam games".to_string())
                .await;
            return;
        }
    };

    let selectors = game_ids
        .into_iter()
        .map(|game_id| Selector { game_id })
        .collect();

    let failed = steam_client
        .sync_steam_metadata(SyncSteamMetadataRequest { selectors })
        .await
        .map_err(|why| {
            warn!("Failed to sync Steam metadata: {}", why);
            why
        })
        .is_err();

    finish_job(job_manager, job_id, failed, "Steam metadata").await;
}

async fn run_similar_phase(db_pool: &DbPool, job_manager: &Arc<JobManager>, job_id: &str) {
    let _ = job_manager
        .update_job(
            job_id,
            Some(0.0),
            Some(JobStatus::Running),
            Some("Computing similar games".to_string()),
        )
        .await;

    let mut builder = QueryBuilder::<RetromDB>::new(
        "insert into similar_games (game_id, similar_game_id) \
         select distinct gt1.game_id, gt2.game_id \
         from game_tags gt1 \
         join game_tags gt2 on gt1.tag_id = gt2.tag_id and gt1.game_id <> gt2.game_id \
         join tags t on t.id = gt1.tag_id \
         join tag_domains d on d.id = t.tag_domain_id \
         where d.name in (",
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(GENRE_DOMAIN);
    separated.push_bind(FRANCHISE_DOMAIN);
    separated.push_unseparated(") on conflict (game_id, similar_game_id) do nothing");

    let failed = builder.build().execute(db_pool).await.is_err();

    if failed {
        error!("Failed to compute similar games");
    }

    finish_job(job_manager, job_id, failed, "Extra metadata").await;
}

async fn metadata_exists(
    db_pool: &DbPool,
    table: &str,
    id_column: &str,
    entity_id: &str,
    provider_id: &str,
) -> Result<Option<String>, sqlx::Error> {
    let mut builder = QueryBuilder::new("select id from ");
    builder.push(table);
    builder.push(" where ");
    builder.push(id_column);
    builder.push(" = ");
    builder.push_bind(entity_id);
    builder.push(" and provider_id = ");
    builder.push_bind(provider_id);

    builder.build_query_scalar().fetch_optional(db_pool).await
}

async fn platform_igdb_id(db_pool: &DbPool, platform_id: &str) -> Result<Option<u64>, sqlx::Error> {
    let mut builder = QueryBuilder::<RetromDB>::new(
        "select provider_platform_id from platform_metadata where platform_id = ",
    );
    builder.push_bind(platform_id);
    builder.push(" and provider_id = ");
    builder.push_bind(IGDB_PROVIDER_ID);

    let provider_platform_id: Option<String> =
        builder.build_query_scalar().fetch_optional(db_pool).await?;

    Ok(provider_platform_id.and_then(|id| id.parse::<u64>().ok()))
}

async fn steam_game_ids(db_pool: &DbPool) -> Result<Vec<String>, sqlx::Error> {
    let mut builder = QueryBuilder::<RetromDB>::new(
        "select id from games where steam_app_id is not null and is_deleted = ",
    );
    builder.push_bind(false);

    builder.build_query_scalar().fetch_all(db_pool).await
}

async fn upsert_platform_metadata(
    db_pool: &DbPool,
    metadata: PlatformMetadata,
) -> Result<String, sqlx::Error> {
    let row_id = uuid::Uuid::now_v7().to_string();

    let mut builder = QueryBuilder::<RetromDB>::new(
        r#"
        insert into platform_metadata (
            id, platform_id, provider_id, provider_platform_id, name, description,
            background_url, icon_url, logo_url
        )
        values (
        "#,
    );
    let mut separated = builder.separated(", ");
    separated.push_bind(row_id);
    separated.push_bind(metadata.platform_id);
    separated.push_bind(metadata.provider_id);
    separated.push_bind(metadata.provider_platform_id);
    separated.push_bind(metadata.name);
    separated.push_bind(metadata.description);
    separated.push_bind(metadata.background_url);
    separated.push_bind(metadata.icon_url);
    separated.push_bind(metadata.logo_url);
    separated.push_unseparated(
        r#")
        on conflict (platform_id, provider_id) do update set
            provider_platform_id = excluded.provider_platform_id,
            name = excluded.name,
            description = excluded.description,
            background_url = excluded.background_url,
            icon_url = excluded.icon_url,
            logo_url = excluded.logo_url,
            updated_at = current_timestamp
        returning id
        "#,
    );

    builder.build_query_scalar().fetch_one(db_pool).await
}

async fn upsert_game_metadata(
    db_pool: &DbPool,
    metadata: GameMetadata,
) -> Result<String, sqlx::Error> {
    let row_id = uuid::Uuid::now_v7().to_string();

    let mut builder = QueryBuilder::<RetromDB>::new(
        r#"
        insert into game_metadata (
            id, game_id, provider_id, provider_game_id, name, description, cover_url,
            background_url, icon_url, logo_url, release_date, last_played, minutes_played
        )
        values (
        "#,
    );
    let mut separated = builder.separated(", ");
    separated.push_bind(row_id);
    separated.push_bind(metadata.game_id);
    separated.push_bind(metadata.provider_id);
    separated.push_bind(metadata.provider_game_id);
    separated.push_bind(metadata.name);
    separated.push_bind(metadata.description);
    separated.push_bind(metadata.cover_url);
    separated.push_bind(metadata.background_url);
    separated.push_bind(metadata.icon_url);
    separated.push_bind(metadata.logo_url);
    separated.push_bind(metadata.release_date);
    separated.push_bind(metadata.last_played);
    separated.push_bind(metadata.minutes_played);
    separated.push_unseparated(
        r#")
        on conflict (game_id, provider_id) do update set
            provider_game_id = excluded.provider_game_id,
            name = excluded.name,
            description = excluded.description,
            cover_url = excluded.cover_url,
            background_url = excluded.background_url,
            icon_url = excluded.icon_url,
            logo_url = excluded.logo_url,
            release_date = excluded.release_date,
            last_played = excluded.last_played,
            minutes_played = excluded.minutes_played,
            updated_at = current_timestamp
        returning id
        "#,
    );

    builder.build_query_scalar().fetch_one(db_pool).await
}

async fn replace_media(
    db_pool: &DbPool,
    table: &str,
    game_metadata_id: &str,
    urls: &[String],
) -> Result<(), sqlx::Error> {
    let mut delete_builder = QueryBuilder::<RetromDB>::new("delete from ");
    delete_builder.push(table);
    delete_builder.push(" where game_metadata_id = ");
    delete_builder.push_bind(game_metadata_id);
    delete_builder.build().execute(db_pool).await?;

    if urls.is_empty() {
        return Ok(());
    }

    let mut insert_builder = QueryBuilder::<RetromDB>::new("insert into ");
    insert_builder.push(table);
    insert_builder.push(" (game_metadata_id, url) ");
    insert_builder.push_values(urls, |mut row, url| {
        row.push_bind(game_metadata_id).push_bind(url);
    });
    insert_builder.push(" on conflict do nothing");
    insert_builder.build().execute(db_pool).await?;

    Ok(())
}

async fn apply_game_tags(
    db_pool: &DbPool,
    game_id: &str,
    domain: &str,
    values: &[String],
) -> Result<(), sqlx::Error> {
    if values.is_empty() {
        return Ok(());
    }

    let domain_id = ensure_tag_domain(db_pool, domain).await?;

    for value in values {
        let tag_id = ensure_tag(db_pool, &domain_id, value).await?;

        let mut builder =
            QueryBuilder::<RetromDB>::new("insert into game_tags (game_id, tag_id) values (");
        let mut separated = builder.separated(", ");
        separated.push_bind(game_id);
        separated.push_bind(&tag_id);
        separated.push_unseparated(") on conflict do nothing");
        builder.build().execute(db_pool).await?;
    }

    Ok(())
}

async fn apply_platform_tags(
    db_pool: &DbPool,
    platform_id: &str,
    domain: &str,
    values: &[String],
) -> Result<(), sqlx::Error> {
    if values.is_empty() {
        return Ok(());
    }

    let domain_id = ensure_tag_domain(db_pool, domain).await?;

    for value in values {
        let tag_id = ensure_tag(db_pool, &domain_id, value).await?;

        let mut builder = QueryBuilder::<RetromDB>::new(
            "insert into platform_tags (platform_id, tag_id) values (",
        );
        let mut separated = builder.separated(", ");
        separated.push_bind(platform_id);
        separated.push_bind(&tag_id);
        separated.push_unseparated(") on conflict do nothing");
        builder.build().execute(db_pool).await?;
    }

    Ok(())
}

async fn ensure_tag_domain(db_pool: &DbPool, name: &str) -> Result<String, sqlx::Error> {
    let mut select_builder =
        QueryBuilder::<RetromDB>::new("select id from tag_domains where name = ");
    select_builder.push_bind(name);

    if let Some(id) = select_builder
        .build_query_scalar::<String>()
        .fetch_optional(db_pool)
        .await?
    {
        return Ok(id);
    }

    let id = uuid::Uuid::now_v7().to_string();
    let mut insert_builder =
        QueryBuilder::<RetromDB>::new("insert into tag_domains (id, name, is_well_known) values (");
    let mut separated = insert_builder.separated(", ");
    separated.push_bind(&id);
    separated.push_bind(name);
    separated.push_bind(false);
    separated.push_unseparated(") on conflict (name) do nothing");
    insert_builder.build().execute(db_pool).await?;

    let mut reselect_builder =
        QueryBuilder::<RetromDB>::new("select id from tag_domains where name = ");
    reselect_builder.push_bind(name);

    reselect_builder
        .build_query_scalar()
        .fetch_one(db_pool)
        .await
}

async fn ensure_tag(db_pool: &DbPool, domain_id: &str, value: &str) -> Result<String, sqlx::Error> {
    let mut select_builder =
        QueryBuilder::<RetromDB>::new("select id from tags where tag_domain_id = ");
    select_builder.push_bind(domain_id);
    select_builder.push(" and value = ");
    select_builder.push_bind(value);

    if let Some(id) = select_builder
        .build_query_scalar::<String>()
        .fetch_optional(db_pool)
        .await?
    {
        return Ok(id);
    }

    let id = uuid::Uuid::now_v7().to_string();
    let mut insert_builder =
        QueryBuilder::<RetromDB>::new("insert into tags (id, tag_domain_id, value) values (");
    let mut separated = insert_builder.separated(", ");
    separated.push_bind(&id);
    separated.push_bind(domain_id);
    separated.push_bind(value);
    separated.push_unseparated(") on conflict (tag_domain_id, value) do nothing");
    insert_builder.build().execute(db_pool).await?;

    let mut reselect_builder =
        QueryBuilder::<RetromDB>::new("select id from tags where tag_domain_id = ");
    reselect_builder.push_bind(domain_id);
    reselect_builder.push(" and value = ");
    reselect_builder.push_bind(value);

    reselect_builder
        .build_query_scalar()
        .fetch_one(db_pool)
        .await
}

fn include_fields(values: Vec<String>) -> IgdbFields {
    IgdbFields {
        selector: Some(FieldSelector::Include(IncludeFields { value: values })),
    }
}

async fn report_progress(job_manager: &Arc<JobManager>, job_id: &str, done: usize, total: usize) {
    let percent = if total == 0 {
        1.0
    } else {
        (done as f32 / total as f32).min(1.0)
    };

    let _ = job_manager
        .update_job(job_id, Some(percent), None, None)
        .await;
}

async fn finish_job(job_manager: &Arc<JobManager>, job_id: &str, failed: bool, label: &str) {
    let message = if failed {
        format!("{label} refresh completed with errors")
    } else {
        format!("{label} refresh complete")
    };

    if let Err(why) = job_manager.complete_job(job_id, failed, message).await {
        warn!("Failed to mark {} job complete: {}", label, why);
    }
}
