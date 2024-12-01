use std::{
    collections::{HashMap, HashSet},
    convert::Infallible,
    sync::Arc,
};

use crate::{
    grpc::jobs::job_manager::JobOptions,
    providers::{
        igdb::provider::IgdbSearchData, GameMetadataProvider, MetadataProvider,
        PlatformMetadataProvider,
    },
};

use super::LibraryServiceHandlers;
use bigdecimal::ToPrimitive;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    self,
    get_igdb_search_request::IgdbSearchType,
    igdb_fields::{IncludeFields, Selector},
    igdb_filters::{FilterOperator, FilterValue},
    igdb_game_search_query::Fields,
    GameGenre, GameMetadata, GetIgdbSearchRequest, IgdbFields, IgdbFilters, IgdbGameSearchQuery,
    NewGameGenre, NewGameGenreMap, NewSimilarGameMap, PlatformMetadata,
    UpdateLibraryMetadataResponse,
};
use retrom_db::schema;
use tracing::{info_span, instrument, Instrument};

#[instrument(skip(state))]
pub async fn update_metadata(
    state: &LibraryServiceHandlers,
    overwrite: bool,
) -> Result<UpdateLibraryMetadataResponse, String> {
    let db_pool = state.db_pool.clone();
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => {
            tracing::error!("Failed to get connection: {}", why);
            return Err(why.to_string());
        }
    };

    let platforms = match schema::platforms::table
        .filter(schema::platforms::third_party.eq(false))
        .load::<retrom::Platform>(&mut conn)
        .await
    {
        Ok(platforms) => platforms,
        Err(e) => {
            tracing::error!("Failed to load platforms: {}", e);
            vec![]
        }
    };

    let platform_tasks = platforms
        .into_iter()
        .map(|platform| {
            let igdb_provider = state.igdb_client.clone();
            let db_pool = db_pool.clone();

            async move {
                let metadata = igdb_provider.get_platform_metadata(platform, None).await;
                let mut conn = match db_pool.get().await {
                    Ok(conn) => conn,
                    Err(why) => {
                        tracing::error!("Failed to get connection: {}", why);
                        return Err(why.to_string());
                    }
                };

                if let Some(metadata) = metadata {
                    diesel::insert_into(schema::platform_metadata::table)
                        .values(&metadata)
                        .on_conflict_do_nothing()
                        .execute(&mut conn)
                        .await
                        .map_err(|e| {
                            tracing::error!("Failed to insert metadata: {}", e);
                            e.to_string()
                        })?;
                };

                tracing::info!("Platform metadata task completed");

                Ok(())
            }
            .instrument(info_span!("Platform Metadata Task"))
        })
        .collect();

    let games: Vec<retrom::Game> = schema::games::table
        .filter(schema::games::third_party.eq(false))
        .load(&mut conn)
        .await
        .map_err(|e| {
            tracing::error!("Failed to load games: {}", e);
            e.to_string()
        })?;

    let game_tasks = games
        .clone()
        .into_iter()
        .map(|game| {
            let igdb_provider = state.igdb_client.clone();
            let db_pool = db_pool.clone();

            async move {
                let mut conn = match db_pool.get().await {
                    Ok(conn) => conn,
                    Err(why) => {
                        return Err(why.to_string());
                    }
                };

                let query = match game.platform_id {
                    Some(id) => {
                        let platform_meta: Option<PlatformMetadata> =
                            schema::platform_metadata::table
                                .find(id)
                                .first(&mut conn)
                                .await
                                .ok();

                        let platform_igdb_id = platform_meta
                            .and_then(|meta| meta.igdb_id)
                            .and_then(|id| id.to_u64());

                        IgdbGameSearchQuery {
                            fields: Some(Fields {
                                platform: platform_igdb_id,
                                ..Default::default()
                            }),
                            ..Default::default()
                        }
                        .into()
                    }
                    None => None,
                };

                let metadata = igdb_provider.get_game_metadata(game, query).await;

                if let Some(metadata) = metadata {
                    if let Err(e) = diesel::insert_into(schema::game_metadata::table)
                        .values(&metadata)
                        .on_conflict_do_nothing()
                        .get_results::<retrom::GameMetadata>(&mut conn)
                        .await
                        .optional()
                    {
                        return Err(e.to_string());
                    };
                };

                Ok(())
            }
        })
        .collect();

    let extra_metadata_tasks = games
        .into_iter()
        .map(|game| {
            let igdb_provider = state.igdb_client.clone();
            let db_pool = db_pool.clone();

            async move {
                let mut conn = match db_pool.get().await {
                    Ok(conn) => conn,
                    Err(why) => {
                        return Err(why.to_string());
                    }
                };

                let all_game_metadata: Vec<GameMetadata> = match schema::game_metadata::table
                    .load::<retrom::GameMetadata>(&mut conn)
                    .await
                {
                    Ok(metadata) => metadata,
                    Err(e) => {
                        return Err(format!("Failed to load metadata: {}", e));
                    }
                };

                let game_meta = match all_game_metadata
                    .iter()
                    .find(|metadata| metadata.game_id == game.id)
                {
                    Some(meta) => meta,
                    None => {
                        tracing::debug!("Game does not have metadata");
                        return Ok(());
                    }
                };

                let game_igdb_id = match game_meta.igdb_id {
                    Some(id) => id,
                    None => {
                        tracing::debug!("Game does not have an IGDB ID");
                        return Ok(());
                    }
                };

                let mut filter_map = HashMap::<String, FilterValue>::new();

                filter_map.insert(
                    "id".to_string(),
                    FilterValue {
                        value: game_igdb_id.to_string(),
                        operator: i32::from(FilterOperator::Equal).into(),
                    },
                );

                let filters = IgdbFilters {
                    filters: filter_map,
                }
                .into();

                let fields = IgdbFields {
                    selector: Some(Selector::Include(IncludeFields {
                        value: [
                            "genres.*",
                            "similar_games.id",
                            "franchise.games.id",
                            "franchises.games.id",
                        ]
                        .into_iter()
                        .map(String::from)
                        .collect(),
                    })),
                }
                .into();

                let query = GetIgdbSearchRequest {
                    search_type: IgdbSearchType::Game.into(),
                    fields,
                    filters,
                    ..Default::default()
                };

                let extra_metadata = match igdb_provider.search_metadata(query).await {
                    Some(IgdbSearchData::Game(matches)) => matches,
                    _ => {
                        return Ok(());
                    }
                };

                let mut similar_game_ids = HashSet::new();

                extra_metadata.games.iter().for_each(|game| {
                    game.similar_games.iter().for_each(|game| {
                        similar_game_ids.insert(game.id);
                    });

                    if let Some(franchise) = game.franchise.as_ref() {
                        franchise.games.iter().for_each(|game| {
                            similar_game_ids.insert(game.id);
                        });
                    }

                    game.franchises.iter().for_each(|franchise| {
                        franchise.games.iter().for_each(|game| {
                            similar_game_ids.insert(game.id);
                        });
                    });
                });

                let new_similar_game_maps = similar_game_ids
                    .into_iter()
                    .filter_map(|id| {
                        let similar_game_id = match all_game_metadata
                            .iter()
                            .find(|metadata| metadata.igdb_id == id.to_i64())
                            .map(|metadata| metadata.game_id)
                        {
                            Some(id) => id,
                            None => return None,
                        };

                        if similar_game_id == game_meta.game_id {
                            return None;
                        }

                        Some(NewSimilarGameMap {
                            game_id: game_meta.game_id,
                            similar_game_id,
                            ..Default::default()
                        })
                    })
                    .collect::<Vec<_>>();

                let new_genres = extra_metadata
                    .games
                    .iter()
                    .flat_map(|igdb_game| {
                        igdb_game.genres.iter().map(|genre| NewGameGenre {
                            slug: genre.slug.clone(),
                            name: genre.name.clone(),
                            ..Default::default()
                        })
                    })
                    .collect::<Vec<_>>();

                if let Err(why) = diesel::insert_into(schema::similar_game_maps::table)
                    .values(&new_similar_game_maps)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to insert similar games: {}", why);
                }

                if let Err(why) = diesel::insert_into(schema::game_genres::table)
                    .values(&new_genres)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to insert genres: {}", why);
                }

                let genres: Vec<GameGenre> = schema::game_genres::table
                    .filter(
                        schema::game_genres::slug
                            .eq_any(new_genres.iter().map(|genre| &genre.slug)),
                    )
                    .load(&mut conn)
                    .await
                    .unwrap_or_default();

                let new_genre_maps = genres
                    .into_iter()
                    .map(|genre| NewGameGenreMap {
                        game_id: game_meta.game_id,
                        genre_id: genre.id,
                        ..Default::default()
                    })
                    .collect::<Vec<_>>();

                if let Err(why) = diesel::insert_into(schema::game_genre_maps::table)
                    .values(&new_genre_maps)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to insert genre maps: {}", why);
                }

                Ok(())
            }
        })
        .collect();

    let steam_provider = state.steam_web_api_client.clone();
    let all_steam_apps = if let Some(steam_provider) = steam_provider.as_ref() {
        match steam_provider.get_owned_games().await {
            Ok(res) => res.response.games,
            Err(e) => {
                tracing::error!("Failed to get owned games: {}", e);
                vec![]
            }
        }
    } else {
        vec![]
    };

    let steam_games: Arc<Vec<retrom::Game>> = Arc::new(
        schema::games::table
            .filter(schema::games::steam_app_id.is_not_null())
            .load::<retrom::Game>(&mut conn)
            .await
            .unwrap_or_default(),
    );

    let steam_tasks: Vec<_> = all_steam_apps
        .into_iter()
        .map(|app| {
            let steam_provider = steam_provider.clone();
            let db_pool = db_pool.clone();
            let steam_games = steam_games.clone();

            let steam_appid = app.appid;

            let game = steam_games
                .iter()
                .find(|game| game.steam_app_id == steam_appid.to_i64())
                .cloned()
                .expect("Game not found");

            async move {
                let steam_provider = match steam_provider.as_ref() {
                    Some(provider) => provider,
                    None => return Ok::<(), Infallible>(()),
                };

                let mut conn = db_pool.get().await.expect("Failed to get connection");

                let existing = schema::game_metadata::table
                    .find(game.id)
                    .first::<retrom::GameMetadata>(&mut conn)
                    .await;

                if existing.is_ok() && !overwrite {
                    tracing::info!("Metadata already exists for game {}", game.path);
                    return Ok(());
                }

                let metadata = steam_provider
                    .get_game_metadata(game, Some(app))
                    .await
                    .expect("Could not get metadata");

                if let Err(why) = diesel::insert_into(schema::game_metadata::table)
                    .values(&metadata)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                {
                    tracing::error!("Failed to update metadata: {}", why);
                }

                Ok::<(), Infallible>(())
            }
        })
        .collect();

    let job_manager = state.job_manager.clone();
    let platform_metadata_job_id = job_manager
        .spawn("Downloading Platform Metadata", platform_tasks, None)
        .await;

    let game_job_opts = JobOptions {
        wait_on_jobs: Some(vec![platform_metadata_job_id]),
    };

    let steam_metadata_job_id = if steam_provider.is_some() {
        let id = job_manager
            .spawn("Downloading Steam Metadata", steam_tasks, None)
            .await;

        Some(id.to_string())
    } else {
        None
    };

    let game_metadata_job_id = job_manager
        .spawn("Downloading Game Metadata", game_tasks, Some(game_job_opts))
        .await;

    let extra_metadata_job_opts = JobOptions {
        wait_on_jobs: Some(vec![game_metadata_job_id]),
    };

    let extra_metadata_job_id = job_manager
        .spawn(
            "Downloading Extra Metadata",
            extra_metadata_tasks,
            Some(extra_metadata_job_opts),
        )
        .await;

    Ok(UpdateLibraryMetadataResponse {
        platform_metadata_job_id: platform_metadata_job_id.to_string(),
        game_metadata_job_id: game_metadata_job_id.to_string(),
        extra_metadata_job_id: extra_metadata_job_id.to_string(),
        steam_metadata_job_id,
    })
}
