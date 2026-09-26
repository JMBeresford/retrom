use crate::metadata_service::{
    game_metadata::{
        game_artwork_rows_from_data, game_link_rows_from_data, game_metadata_from_rows,
        game_metadata_row_from_metadata, game_screenshot_rows_from_data, game_video_rows_from_data,
        insert_game_metadata, select_game_metadata_artworks, select_game_metadata_links,
        select_game_metadata_row, select_game_metadata_screenshots, select_game_metadata_videos,
        select_similar_games, similar_game_rows_from_data, upsert_game_artworks, upsert_game_links,
        upsert_game_screenshots, upsert_game_videos, upsert_similar_games, GameMetadataRows,
    },
    platform_metadata::{
        insert_platform_metadata, platform_metadata_from_rows, rows_from_platform_metadata,
        update_platform_metadata as update_platform_metadata_row,
    },
};
use futures::{
    future::{join_all, try_join_all},
    FutureExt,
};
use retrom_codegen::retrom::{
    providers::igdb::v1::{
        igdb_filters::{FilterOperator, FilterValue},
        IgdbFilters,
    },
    services::{
        config::v1::{GetServerConfigRequest, MetadataConfig},
        jobs::v1::JobStatus,
        metadata::v1::{
            metadata_service_server::MetadataService, BulkGetGameMetadataRequest,
            BulkGetGameMetadataResponse, BulkGetPlatformMetadataRequest,
            BulkGetPlatformMetadataResponse, DownloadGameMetadataRequest,
            DownloadGameMetadataResponse, DownloadPlatformMetadataRequest,
            DownloadPlatformMetadataResponse, GameMetadata, GetGameMetadataRequest,
            GetIgdbGameMetadataRequest, GetIgdbPlatformMetadataRequest, GetPlatformMetadataRequest,
            GetSteamGameMetadataRequest, IgdbSearchRequest, ListGameMetadataRequest,
            ListGameMetadataResponse, ListPlatformMetadataRequest, ListPlatformMetadataResponse,
            PlatformMetadata, PurgeLocalMetadataRequest, PurgeLocalMetadataResponse,
            StatLocalMetadataRequest, StatLocalMetadataResponse, UpdateGameMetadataRequest,
            UpdatePlatformMetadataRequest,
        },
    },
};
use retrom_db::DbPool;
use retrom_service_common::{
    grpc_clients::{
        config_svc::CommonConfigServiceClient,
        igdb_svc::{get_igdb_svc_client, CommonIgdbServiceClient},
        steam_svc::{get_steam_svc_client, CommonSteamServiceClient},
    },
    media_cache::{cacheable_media::CacheableMetadata, MediaCache},
    metadata_providers::{
        igdb::provider::IGDB_PROVIDER_ID, steam::provider::STEAM_PROVIDER_ID, MANUAL_PROVIDER_ID,
    },
    retrom_dirs::RetromDirs,
};
use retrom_service_jobs::job_manager::JobManager;
use sqlx::QueryBuilder;
use std::{
    collections::{HashMap, HashSet},
    fmt::Display,
    future::Future,
    sync::Arc,
};
use tokio::{join, try_join};
use tonic::{Code, Request, Response, Status};
use tracing::{error, instrument, Instrument, Span};
use tracing_opentelemetry::OpenTelemetrySpanExt;
use walkdir::WalkDir;

pub(crate) mod descriptor_pool;
mod game_metadata;
mod platform_metadata;
pub(super) mod router;

#[derive(Clone)]
pub struct MetadataServiceHandlers {
    pub db_pool: DbPool,
    pub media_cache: Arc<MediaCache>,
    pub job_manager: Arc<JobManager>,
    config_client: CommonConfigServiceClient,
    igdb_svc_client: CommonIgdbServiceClient,
    steam_svc_client: CommonSteamServiceClient,
}

impl MetadataServiceHandlers {
    pub fn new(
        db_pool: DbPool,
        media_cache: Arc<MediaCache>,
        job_manager: Arc<JobManager>,
        config_client: CommonConfigServiceClient,
    ) -> Self {
        Self {
            db_pool,
            media_cache,
            job_manager,
            config_client,
            igdb_svc_client: get_igdb_svc_client(None),
            steam_svc_client: get_steam_svc_client(None),
        }
    }

    #[tracing::instrument(skip(db_pool, metadata))]
    async fn handle_create_game_metadata(
        db_pool: DbPool,
        metadata: GameMetadata,
        provider_id: &str,
        provider_game_id: &Option<String>,
    ) -> Result<GameMetadata, Status> {
        let game_id = metadata.game.trim();
        if game_id.is_empty() {
            return Err(Status::invalid_argument(
                "game field is required for creating game metadata".to_string(),
            ));
        }

        let to_create = game_metadata_row_from_metadata(&metadata, provider_id, provider_game_id);
        let row = insert_game_metadata(&db_pool, &to_create).await?;

        let (artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) = (
            game_artwork_rows_from_data(game_id, provider_id, metadata.artworks.clone()),
            game_screenshot_rows_from_data(game_id, provider_id, metadata.screenshots.clone()),
            game_video_rows_from_data(game_id, provider_id, metadata.videos.clone()),
            game_link_rows_from_data(game_id, provider_id, metadata.links.clone()),
            similar_game_rows_from_data(game_id, metadata.similar_games.clone()),
        );

        let (artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) = try_join!(
            upsert_game_artworks(&db_pool, artwork_rows),
            upsert_game_screenshots(&db_pool, screenshot_rows),
            upsert_game_videos(&db_pool, video_rows),
            upsert_game_links(&db_pool, link_rows),
            upsert_similar_games(&db_pool, similar_game_rows)
        )?;

        Ok(game_metadata_from_rows(GameMetadataRows {
            metadata_row: row,
            artwork_rows,
            screenshot_rows,
            video_rows,
            link_rows,
            similar_game_rows,
        }))
    }

    #[tracing::instrument(err, skip_all)]
    async fn handle_get_game_metadata_by_provider(
        db_pool: DbPool,
        game_id: &str,
        provider_id: &str,
    ) -> Result<GameMetadata, Status> {
        let (row, artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) = try_join!(
            select_game_metadata_row(&db_pool, game_id, provider_id),
            select_game_metadata_artworks(&db_pool, game_id, provider_id),
            select_game_metadata_screenshots(&db_pool, game_id, provider_id),
            select_game_metadata_videos(&db_pool, game_id, provider_id),
            select_game_metadata_links(&db_pool, game_id, provider_id),
            select_similar_games(&db_pool, game_id)
        )?;

        Ok(game_metadata_from_rows(GameMetadataRows {
            metadata_row: row,
            artwork_rows,
            screenshot_rows,
            video_rows,
            link_rows,
            similar_game_rows,
        }))
    }

    /// A helper function to select a field from a vector of optional `GameMetadata` values using a
    /// selector function. If the selector returns `None`, the function
    /// will continue to the next `GameMetadata` in the vector. If the selector returns `Some(value)`,
    /// the function will return that value.
    pub(super) fn select_field_from_game_metadata<T>(
        metadata: Vec<&Option<GameMetadata>>,
        selector: fn(&GameMetadata) -> Option<&T>,
    ) -> Vec<&T> {
        metadata
            .into_iter()
            .filter_map(|m| m.as_ref().and_then(selector))
            .collect::<Vec<_>>()
    }

    #[tracing::instrument(err, skip_all)]
    async fn handle_get_game_metadata(
        db_pool: DbPool,
        request: GetGameMetadataRequest,
    ) -> Result<GameMetadata, Status> {
        let name = request.name;
        let mut router = matchit::Router::new();

        router
            .insert("games/{game_id}/metadata", "game_metadata_singleton")
            .map_err(|e| Status::internal(e.to_string()))?;

        let game_id = match router
            .at(&name)
            .map(|matched| matched.params.get("game_id").map(|s| s.to_string()))
        {
            Ok(Some(game_id)) => game_id,
            _ => {
                return Err(Status::invalid_argument(format!(
                    "Invalid game metadata name: {}",
                    name
                )))
            }
        };

        let (manual_metadata, igdb_metadata, steam_metadata) = join!(
            Self::handle_get_game_metadata_by_provider(
                db_pool.clone(),
                &game_id,
                MANUAL_PROVIDER_ID
            ),
            Self::handle_get_game_metadata_by_provider(db_pool.clone(), &game_id, IGDB_PROVIDER_ID),
            Self::handle_get_game_metadata_by_provider(
                db_pool.clone(),
                &game_id,
                STEAM_PROVIDER_ID
            )
        );

        let not_found_to_option = |result: Result<GameMetadata, Status>| match result {
            Ok(metadata) => Ok(Some(metadata)),
            Err(status) => match status.code() {
                Code::NotFound => Ok(None),
                _ => Err(status),
            },
        };

        let (manual_metadata, igdb_metadata, steam_metadata) = (
            Some(manual_metadata?),
            not_found_to_option(igdb_metadata)?,
            not_found_to_option(steam_metadata)?,
        );

        // The most recently updated metadata should be used to determine the
        // updated_at timestamp for the returned metadata.
        let updated_at = Self::select_field_from_game_metadata(
            vec![&igdb_metadata, &steam_metadata, &manual_metadata],
            |m| m.updated_at.as_ref(),
        )
        .into_iter()
        .max()
        .cloned();

        let title = Self::select_field_from_game_metadata(
            vec![&igdb_metadata, &steam_metadata, &manual_metadata],
            |m| Some(&m.title),
        )
        .into_iter()
        .next()
        .cloned()
        .unwrap_or_else(|| "Unknown Game".to_string());

        let description = Self::select_field_from_game_metadata(
            vec![&manual_metadata, &igdb_metadata, &steam_metadata],
            |m| m.description.as_ref(),
        )
        .into_iter()
        .next()
        .cloned();

        let cover_url = Self::select_field_from_game_metadata(
            vec![&manual_metadata, &igdb_metadata, &steam_metadata],
            |m| m.cover_url.as_ref(),
        )
        .into_iter()
        .next()
        .cloned();

        let background_url = Self::select_field_from_game_metadata(
            vec![&manual_metadata, &igdb_metadata, &steam_metadata],
            |m| m.background_url.as_ref(),
        )
        .into_iter()
        .next()
        .cloned();

        let icon_url = Self::select_field_from_game_metadata(
            vec![&manual_metadata, &igdb_metadata, &steam_metadata],
            |m| m.icon_url.as_ref(),
        )
        .into_iter()
        .next()
        .cloned();

        let logo_url = Self::select_field_from_game_metadata(
            vec![&manual_metadata, &igdb_metadata, &steam_metadata],
            |m| m.logo_url.as_ref(),
        )
        .into_iter()
        .next()
        .cloned();

        let release_date = Self::select_field_from_game_metadata(
            vec![&manual_metadata, &igdb_metadata, &steam_metadata],
            |m| m.release_date.as_ref(),
        )
        .into_iter()
        .next()
        .cloned();

        let artworks = [&manual_metadata, &igdb_metadata, &steam_metadata]
            .iter()
            .filter_map(|x| x.as_ref().map(|m| m.artworks.clone()))
            .flatten()
            .collect::<Vec<_>>();

        let screenshots = [&manual_metadata, &igdb_metadata, &steam_metadata]
            .iter()
            .filter_map(|x| x.as_ref().map(|m| m.screenshots.clone()))
            .flatten()
            .collect::<Vec<_>>();

        let videos = [&manual_metadata, &igdb_metadata, &steam_metadata]
            .iter()
            .filter_map(|x| x.as_ref().map(|m| m.videos.clone()))
            .flatten()
            .collect::<Vec<_>>();

        let links = [&manual_metadata, &igdb_metadata, &steam_metadata]
            .iter()
            .filter_map(|x| x.as_ref().map(|m| m.links.clone()))
            .flatten()
            .collect::<Vec<_>>();

        let similar_games = [&manual_metadata, &igdb_metadata, &steam_metadata]
            .iter()
            .filter_map(|x| x.as_ref().map(|m| m.similar_games.clone()))
            .flatten()
            .collect::<Vec<_>>();

        Ok(GameMetadata {
            name,
            game: game_id,
            created_at: manual_metadata.as_ref().and_then(|m| m.created_at),
            updated_at,
            title,
            description,
            cover_url,
            background_url,
            icon_url,
            logo_url,
            release_date,
            last_played: manual_metadata.as_ref().and_then(|m| m.last_played),
            minutes_played: manual_metadata.as_ref().and_then(|m| m.minutes_played),
            artworks,
            screenshots,
            videos,
            links,
            similar_games,
        })
    }

    #[instrument(err, skip_all)]
    async fn cache_metadata<T: CacheableMetadata>(
        &self,
        metadata: &T,
        job_name: &str,
        config: Option<MetadataConfig>,
    ) -> Result<(), Status> {
        if let Err(e) = metadata.clean_cache().await {
            error!("Failed to clean cache for metadata: {}", e);
        }

        let tasks = metadata
            .get_cacheable_media_opts()
            .into_iter()
            .map({
                let cache = self.media_cache.clone();
                move |opt| {
                    let cache = cache.clone();
                    async move { cache.cache_media_file(&opt, config).await }
                }
            })
            .collect();

        spawn_cache_job(self.job_manager.clone(), job_name.to_string(), tasks).await;

        Ok(())
    }

    #[instrument(err, skip(db_pool, request))]
    async fn handle_update_game_metadata(
        db_pool: DbPool,
        request: UpdateGameMetadataRequest,
        provider_id: &str,
        provider_game_id: &Option<String>,
    ) -> Result<GameMetadata, Status> {
        let field_mask: HashSet<String> = request
            .update_mask
            .unwrap_or_default()
            .paths
            .into_iter()
            .collect();

        let metadata = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating game metadata".to_string(),
                ));
            }
        };

        if metadata.game.trim().is_empty() {
            return Err(Status::invalid_argument(
                "game field is required for updating game metadata".to_string(),
            ));
        }

        let empty_mask = field_mask.is_empty();

        let row = game_metadata_row_from_metadata(&metadata, provider_id, provider_game_id);
        let game_id = &row.game_id;
        let provider_id = &row.provider_id;

        let (artworks, screenshots, videos, links, similar_games) = (
            game_artwork_rows_from_data(game_id, provider_id, metadata.artworks.clone()),
            game_screenshot_rows_from_data(game_id, provider_id, metadata.screenshots.clone()),
            game_video_rows_from_data(game_id, provider_id, metadata.videos.clone()),
            game_link_rows_from_data(game_id, provider_id, metadata.links.clone()),
            similar_game_rows_from_data(game_id, metadata.similar_games.clone()),
        );

        let row_future = game_metadata::update_game_metadata(&db_pool, &row, &field_mask);

        let artwork_rows_future = async {
            if empty_mask || field_mask.contains("artworks") {
                game_metadata::upsert_game_artworks(&db_pool, artworks).await?;
            }

            game_metadata::select_game_metadata_artworks(&db_pool, game_id, provider_id).await
        };

        let screenshot_rows_future = async {
            if empty_mask || field_mask.contains("screenshots") {
                game_metadata::upsert_game_screenshots(&db_pool, screenshots).await?;
            }

            game_metadata::select_game_metadata_screenshots(&db_pool, game_id, provider_id).await
        };

        let video_rows_future = async {
            if empty_mask || field_mask.contains("videos") {
                game_metadata::upsert_game_videos(&db_pool, videos).await?;
            }

            game_metadata::select_game_metadata_videos(&db_pool, game_id, provider_id).await
        };

        let link_rows_future = async {
            if empty_mask || field_mask.contains("links") {
                game_metadata::upsert_game_links(&db_pool, links).await?;
            }

            game_metadata::select_game_metadata_links(&db_pool, game_id, provider_id).await
        };

        let similar_game_rows_future = async {
            if empty_mask || field_mask.contains("similar_games") {
                game_metadata::upsert_similar_games(&db_pool, similar_games).await?;
            }

            game_metadata::select_similar_games(&db_pool, game_id).await
        };

        let (row, artwork_rows, screenshot_rows, video_rows, link_rows, similar_game_rows) = try_join!(
            row_future,
            artwork_rows_future,
            screenshot_rows_future,
            video_rows_future,
            link_rows_future,
            similar_game_rows_future
        )?;

        Ok(game_metadata_from_rows(GameMetadataRows {
            metadata_row: row,
            artwork_rows,
            screenshot_rows,
            video_rows,
            link_rows,
            similar_game_rows,
        }))
    }

    #[instrument(err, skip_all)]
    async fn handle_get_platform_metadata(
        db_pool: DbPool,
        request: GetPlatformMetadataRequest,
    ) -> Result<PlatformMetadata, Status> {
        let name = request.name;
        let mut router = matchit::Router::new();

        router
            .insert(
                "platforms/{platform_id}/metadata",
                "platform_metadata_singleton",
            )
            .map_err(|e| Status::internal(e.to_string()))?;

        let platform_id = match router
            .at(&name)
            .map(|matched| matched.params.get("platform_id").map(|s| s.to_string()))
        {
            Ok(Some(platform_id)) => platform_id,
            _ => {
                return Err(Status::invalid_argument(format!(
                    "Invalid platform metadata name: {}",
                    name
                )))
            }
        };

        let mut builder = QueryBuilder::new("select * from platform_metadata where platform_id = ");
        builder.push_bind(&platform_id);
        builder.push(" order by provider_id desc ");
        builder.push(" limit 1");

        let row: retrom_codegen::retrom::services::metadata::v1::PlatformMetadataRow = builder
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(platform_metadata_from_rows(row))
    }

    #[instrument(err, skip_all)]
    async fn handle_create_platform_metadata(
        db_pool: DbPool,
        metadata: PlatformMetadata,
        provider_id: &str,
        provider_platform_id: &Option<String>,
    ) -> Result<PlatformMetadata, Status> {
        if metadata.platform.trim().is_empty() {
            return Err(Status::invalid_argument(
                "platform field is required for creating platform metadata".to_string(),
            ));
        }

        if metadata.name.trim().is_empty() {
            return Err(Status::invalid_argument(
                "name field is required for creating platform metadata".to_string(),
            ));
        }

        let row = rows_from_platform_metadata(metadata, provider_id, provider_platform_id);
        let row = insert_platform_metadata(&db_pool, row).await?;

        Ok(platform_metadata_from_rows(row))
    }

    #[instrument(err, skip_all)]
    async fn handle_update_platform_metadata(
        db_pool: DbPool,
        request: UpdatePlatformMetadataRequest,
        provider_id: &str,
        platform_provider_id: &Option<String>,
    ) -> Result<PlatformMetadata, Status> {
        let field_mask: HashSet<String> = request
            .update_mask
            .unwrap_or_default()
            .paths
            .into_iter()
            .collect();

        let metadata = match request.metadata {
            Some(metadata) => metadata,
            None => {
                return Err(Status::invalid_argument(
                    "metadata field is required for updating platform metadata".to_string(),
                ));
            }
        };

        if metadata.name.trim().is_empty() {
            return Err(Status::invalid_argument(
                "name field is required for updating platform metadata".to_string(),
            ));
        }

        let row = rows_from_platform_metadata(metadata, provider_id, platform_provider_id);
        let row = update_platform_metadata_row(&db_pool, &row, &field_mask).await?;

        Ok(platform_metadata_from_rows(row))
    }
}

async fn spawn_cache_job<T, E, F>(job_manager: Arc<JobManager>, job_name: String, tasks: Vec<F>)
where
    T: Send + 'static,
    E: Display + Send + 'static,
    F: Future<Output = Result<T, E>> + Send + 'static,
{
    if tasks.is_empty() {
        return;
    }

    let job = job_manager
        .create_job(job_name.clone(), "Queued media cache job".to_string())
        .await;

    let job_id = job.id;

    let span = tracing::info_span!("cache_job", job_name = %job_name);
    span.follows_from(Span::current());

    tokio::spawn(
        async move {
            let _ = job_manager
                .update_job(
                    &job_id,
                    Some(0.0),
                    Some(JobStatus::Running),
                    Some("Caching media files".to_string()),
                )
                .await;

            let results = join_all(tasks).await;
            let failed = results.iter().any(Result::is_err);
            for result in results {
                if let Err(err) = result {
                    tracing::warn!("Failed to cache media file: {}", err);
                }
            }

            let _ = job_manager
                .complete_job(
                    &job_id,
                    failed,
                    if failed {
                        "Media cache job completed with errors".to_string()
                    } else {
                        "Media cache job completed".to_string()
                    },
                )
                .await;
        }
        .instrument(span),
    );
}

#[tonic::async_trait]
impl MetadataService for MetadataServiceHandlers {
    async fn get_game_metadata(
        &self,
        request: Request<GetGameMetadataRequest>,
    ) -> Result<Response<GameMetadata>, Status> {
        let metadata =
            Self::handle_get_game_metadata(self.db_pool.clone(), request.into_inner()).await?;

        Ok(Response::new(metadata))
    }

    async fn list_game_metadata(
        &self,
        request: Request<ListGameMetadataRequest>,
    ) -> Result<Response<ListGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let game_ids = request.game_ids;
        let title = request.title;

        let mut builder = QueryBuilder::new(
            "select distinct game_id from game_metadata where game_id is not null ",
        );

        if !game_ids.is_empty() {
            builder.push(" and game_id in (");
            let mut separated = builder.separated(", ");
            for game_id in game_ids {
                separated.push_bind(game_id);
            }

            separated.push_unseparated(")");
        }

        if let Some(title) = title {
            builder.push(" and title ilike ");
            builder.push_bind(format!("%{}%", title));
        }

        let ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let game_metadata = try_join_all(ids.into_iter().map(|game_id| {
            let db_pool = self.db_pool.clone();
            async move {
                Self::handle_get_game_metadata(
                    db_pool,
                    GetGameMetadataRequest {
                        name: format!("games/{game_id}/metadata"),
                    },
                )
                .await
            }
        }))
        .await?;

        Ok(Response::new(ListGameMetadataResponse { game_metadata }))
    }

    async fn update_game_metadata(
        &self,
        request: Request<UpdateGameMetadataRequest>,
    ) -> Result<Response<GameMetadata>, Status> {
        let request = request.into_inner();

        let mut config_svc_client = self.config_client.clone();
        let config = config_svc_client
            .get_server_config(GetServerConfigRequest {})
            .await?
            .into_inner();

        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        if let Some(ref metadata) = request.metadata {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for metadata: {}", e);
            }
        }

        if store_metadata {
            if let Some(ref metadata) = request.metadata {
                let metadata_config = self
                    .config_client
                    .clone()
                    .get_server_config(GetServerConfigRequest {})
                    .await?
                    .into_inner()
                    .metadata;

                self.cache_metadata(
                    metadata,
                    &format!("Cache Media Files For Game {}", metadata.game),
                    metadata_config,
                )
                .await?;
            }
        };

        let metadata = Self::handle_update_game_metadata(
            self.db_pool.clone(),
            request,
            MANUAL_PROVIDER_ID,
            &None,
        )
        .await?;

        Ok(Response::new(metadata))
    }

    async fn bulk_get_game_metadata(
        &self,
        request: Request<BulkGetGameMetadataRequest>,
    ) -> Result<Response<BulkGetGameMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let game_metadata = try_join_all(requests.into_iter().map(|r| {
            let db_pool = self.db_pool.clone();

            async move { Self::handle_get_game_metadata(db_pool, r).await }
        }))
        .await?;

        Ok(Response::new(BulkGetGameMetadataResponse { game_metadata }))
    }

    async fn get_platform_metadata(
        &self,
        request: Request<GetPlatformMetadataRequest>,
    ) -> Result<Response<PlatformMetadata>, Status> {
        let metadata =
            Self::handle_get_platform_metadata(self.db_pool.clone(), request.into_inner()).await?;

        Ok(Response::new(metadata))
    }

    async fn list_platform_metadata(
        &self,
        request: Request<ListPlatformMetadataRequest>,
    ) -> Result<Response<ListPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_ids = request.platform_ids;
        let title = request.title;

        let mut builder = QueryBuilder::new(
            "select distinct id from platform_metadata where platform_id is not null ",
        );

        if !platform_ids.is_empty() {
            builder.push(" and platform_id in (");
            let mut separated = builder.separated(", ");
            for platform_id in platform_ids {
                separated.push_bind(platform_id);
            }
            separated.push_unseparated(")");
        }

        if let Some(title) = title {
            builder.push(" and name ilike ");
            builder.push_bind(format!("%{}% ", title));
        }

        let ids: Vec<String> = builder
            .build_query_scalar()
            .fetch_all(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let metadata = try_join_all(ids.into_iter().map(|id| {
            let db_pool = self.db_pool.clone();
            async move {
                Self::handle_get_platform_metadata(
                    db_pool,
                    GetPlatformMetadataRequest {
                        name: format!("platforms/{}/metadata", id),
                    },
                )
                .await
            }
        }))
        .await?;

        Ok(Response::new(ListPlatformMetadataResponse { metadata }))
    }

    async fn update_platform_metadata(
        &self,
        request: Request<UpdatePlatformMetadataRequest>,
    ) -> Result<Response<PlatformMetadata>, Status> {
        let request = request.into_inner();

        let mut config_svc_client = self.config_client.clone();
        let config = config_svc_client
            .get_server_config(GetServerConfigRequest {})
            .await?
            .into_inner();

        let store_metadata = config
            .metadata
            .map(|m| m.store_metadata_locally)
            .unwrap_or(false);

        if let Some(ref metadata) = request.metadata {
            if let Err(e) = metadata.clean_cache().await {
                error!("Failed to clean cache for metadata: {}", e);
            }
        }

        if store_metadata {
            if let Some(ref metadata) = request.metadata {
                let metadata_config = self
                    .config_client
                    .clone()
                    .get_server_config(GetServerConfigRequest {})
                    .await?
                    .into_inner()
                    .metadata;

                self.cache_metadata(
                    metadata,
                    &format!("Cache Media Files For Platform {}", metadata.platform),
                    metadata_config,
                )
                .await?;
            }
        };

        let metadata = Self::handle_update_platform_metadata(
            self.db_pool.clone(),
            request,
            MANUAL_PROVIDER_ID,
            &None,
        )
        .await?;

        Ok(Response::new(metadata))
    }

    async fn bulk_get_platform_metadata(
        &self,
        request: Request<BulkGetPlatformMetadataRequest>,
    ) -> Result<Response<BulkGetPlatformMetadataResponse>, Status> {
        let requests = request.into_inner().requests;

        let metadata = try_join_all(requests.into_iter().map(|r| {
            let db_pool = self.db_pool.clone();

            async move { Self::handle_get_platform_metadata(db_pool, r).await }
        }))
        .await?;

        Ok(Response::new(BulkGetPlatformMetadataResponse { metadata }))
    }

    async fn stat_local_metadata(
        &self,
        _request: Request<StatLocalMetadataRequest>,
    ) -> Result<Response<StatLocalMetadataResponse>, Status> {
        let response = tokio::task::spawn_blocking(|| {
            let media_dir = RetromDirs::new().media_dir();

            let mut total_byte_size = 0i64;
            let mut total_files = 0;

            for entry in WalkDir::new(media_dir)
                .into_iter()
                .filter_map(Result::ok)
                .filter(|e| e.file_type().is_file())
            {
                let size = i64::try_from(entry.metadata().map(|m| m.len()).unwrap_or(0))
                    .unwrap_or(i64::MAX);

                total_files += 1;
                total_byte_size = total_byte_size.saturating_add(size);
            }

            StatLocalMetadataResponse {
                total_byte_size,
                total_files,
            }
        })
        .await
        .map_err(|e| Status::internal(format!("Failed to compute local metadata status: {}", e)))?;

        Ok(Response::new(response))
    }

    async fn purge_local_metadata(
        &self,
        _request: Request<PurgeLocalMetadataRequest>,
    ) -> Result<Response<PurgeLocalMetadataResponse>, Status> {
        let media_dir = RetromDirs::new().media_dir();

        if media_dir.exists() {
            tokio::fs::remove_dir_all(&media_dir)
                .await
                .map_err(|e| Status::internal(format!("Failed to delete local metadata: {}", e)))?;
        }

        Ok(Response::new(PurgeLocalMetadataResponse {}))
    }

    async fn download_game_metadata(
        &self,
        request: Request<DownloadGameMetadataRequest>,
    ) -> Result<Response<DownloadGameMetadataResponse>, Status> {
        let request = request.into_inner();
        let overwrite = request.overwrite;
        let game_id = request.game_id;

        let span = Span::current();
        span.set_attribute("retrom.game.id", game_id.clone());
        span.set_attribute("retrom.overwrite", overwrite);

        let igdb_job = async {
            let existing: Option<(String, Option<String>)> = QueryBuilder::new(
                "select game_id, provider_game_id from game_metadata where game_id = ",
            )
            .push_bind(&game_id)
            .push(" and provider_id = ")
            .push_bind(IGDB_PROVIDER_ID)
            .build_query_as()
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

            let igdb_id = existing
                .as_ref()
                .and_then(|(_, provider_game_id)| provider_game_id.clone());

            let mut igdb = self.igdb_svc_client.clone();

            let igdb_search = igdb_id.as_ref().map(|id| IgdbSearchRequest {
                filters: Some(IgdbFilters {
                    filters: HashMap::from([(
                        "id".to_string(),
                        FilterValue {
                            value: id.to_string(),
                            operator: Some(FilterOperator::Equal as i32),
                        },
                    )]),
                }),
                ..Default::default()
            });

            let igdb_metadata = if existing.is_none() || overwrite {
                match igdb
                    .get_igdb_game_metadata(GetIgdbGameMetadataRequest {
                        game_id: game_id.clone(),
                        search: igdb_search,
                        ..Default::default()
                    })
                    .await
                {
                    Ok(response) => response.into_inner(),
                    Err(status) => match status.code() {
                        Code::NotFound => {
                            return Ok(None);
                        }
                        _ => {
                            return Err(status);
                        }
                    },
                }
            } else {
                return Ok(None);
            };

            if existing.is_some() {
                Some(
                    Self::handle_update_game_metadata(
                        self.db_pool.clone(),
                        UpdateGameMetadataRequest {
                            metadata: Some(igdb_metadata),
                            update_mask: None,
                        },
                        IGDB_PROVIDER_ID,
                        &igdb_id,
                    )
                    .await,
                )
                .transpose()
            } else {
                Some(
                    Self::handle_create_game_metadata(
                        self.db_pool.clone(),
                        igdb_metadata,
                        IGDB_PROVIDER_ID,
                        &igdb_id,
                    )
                    .await,
                )
                .transpose()
            }
        }
        .instrument(tracing::info_span!("download_igdb_metadata"))
        .boxed();

        let steam_job = async {
            let steam_app_id: Option<String> =
                QueryBuilder::new("select steam_app_id from games where id = ")
                    .push_bind(&game_id)
                    .build_query_scalar()
                    .fetch_one(&self.db_pool)
                    .await
                    .map_err(|e| Status::internal(e.to_string()))?;

            if steam_app_id.is_none() {
                tracing::debug!(
                    "Game {} does not have a Steam App ID, skipping Steam metadata download",
                    game_id
                );

                return Ok(None);
            }

            let existing: Option<(String, Option<String>)> = QueryBuilder::new(
                "select game_id, provider_game_id from game_metadata where game_id = ",
            )
            .push_bind(&game_id)
            .push(" and provider_id = ")
            .push_bind(STEAM_PROVIDER_ID)
            .build_query_as()
            .fetch_optional(&self.db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

            let mut steam = self.steam_svc_client.clone();

            let steam_metadata = if existing.is_some() {
                match steam
                    .get_steam_game_metadata(Request::new(GetSteamGameMetadataRequest {
                        game_id: game_id.clone(),
                    }))
                    .await
                {
                    Ok(response) => response.into_inner(),
                    Err(status) => match status.code() {
                        Code::NotFound => {
                            return Ok(None);
                        }
                        _ => {
                            return Err(status);
                        }
                    },
                }
            } else {
                return Ok(None);
            };

            if existing.is_some() {
                Some(
                    Self::handle_update_game_metadata(
                        self.db_pool.clone(),
                        UpdateGameMetadataRequest {
                            metadata: Some(steam_metadata),
                            update_mask: None,
                        },
                        STEAM_PROVIDER_ID,
                        &steam_app_id,
                    )
                    .await,
                )
                .transpose()
            } else {
                Some(
                    Self::handle_create_game_metadata(
                        self.db_pool.clone(),
                        steam_metadata,
                        STEAM_PROVIDER_ID,
                        &steam_app_id,
                    )
                    .await,
                )
                .transpose()
            }
        }
        .instrument(tracing::info_span!("download_steam_metadata"))
        .boxed();

        for result in join_all(vec![igdb_job, steam_job]).await {
            if let Err(status) = result {
                match status.code() {
                    Code::NotFound => {}
                    _ => {
                        return Err(status);
                    }
                }
            }
        }

        Ok(Response::new(DownloadGameMetadataResponse {}))
    }

    async fn download_platform_metadata(
        &self,
        request: Request<DownloadPlatformMetadataRequest>,
    ) -> Result<Response<DownloadPlatformMetadataResponse>, Status> {
        let request = request.into_inner();
        let platform_id = request.platform_id;
        let overwrite = request.overwrite;

        let existing: Option<(String, Option<String>)> = QueryBuilder::new(
            "select platform_id, provider_platform_id from platform_metadata where platform_id = ",
        )
        .push_bind(&platform_id)
        .push(" and provider_id = ")
        .push_bind(IGDB_PROVIDER_ID)
        .build_query_as()
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        let mut igdb = self.igdb_svc_client.clone();

        let igdb_id = existing
            .as_ref()
            .and_then(|(_, provider_platform_id)| provider_platform_id.clone());

        let igdb_search = igdb_id.as_ref().map(|id| IgdbSearchRequest {
            filters: Some(IgdbFilters {
                filters: HashMap::from([(
                    "id".to_string(),
                    FilterValue {
                        value: id.to_string(),
                        operator: Some(FilterOperator::Equal as i32),
                    },
                )]),
            }),
            ..Default::default()
        });

        let igdb_metadata = if existing.is_none() || overwrite {
            match igdb
                .get_igdb_platform_metadata(GetIgdbPlatformMetadataRequest {
                    platform_id: platform_id.clone(),
                    search: igdb_search,
                })
                .await
            {
                Ok(response) => response.into_inner(),
                Err(status) => match status.code() {
                    Code::NotFound => {
                        return Ok(Response::new(DownloadPlatformMetadataResponse {}));
                    }
                    _ => {
                        return Err(status);
                    }
                },
            }
        } else {
            return Ok(Response::new(DownloadPlatformMetadataResponse {}));
        };

        if existing.is_some() {
            Self::handle_update_platform_metadata(
                self.db_pool.clone(),
                UpdatePlatformMetadataRequest {
                    metadata: Some(igdb_metadata),
                    update_mask: None,
                },
                IGDB_PROVIDER_ID,
                &igdb_id,
            )
            .await?;
        } else {
            Self::handle_create_platform_metadata(
                self.db_pool.clone(),
                igdb_metadata,
                IGDB_PROVIDER_ID,
                &igdb_id,
            )
            .await?;
        }

        Ok(Response::new(DownloadPlatformMetadataResponse {}))
    }
}
