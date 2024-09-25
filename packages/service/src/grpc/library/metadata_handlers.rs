use std::{collections::HashSet, sync::Arc};

use crate::{
    grpc::jobs::job_manager::JobOptions,
    providers::igdb::{games::match_game_igdb, platforms::match_platform_igdb},
};

use super::LibraryServiceHandlers;
use bigdecimal::ToPrimitive;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use prost::Message;
use retrom_codegen::{
    igdb,
    retrom::{
        self, GameGenre, GameMetadata, NewGameGenre, NewGameGenreMap, NewSimilarGameMap,
        UpdateLibraryMetadataResponse,
    },
};
use retrom_db::schema;
use tracing::instrument;

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
                let metadata = match_platform_igdb(igdb_provider.clone(), &platform).await;
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

                Ok(())
            }
        })
        .collect();

    let games = schema::games::table.load(&mut conn).await.map_err(|e| {
        tracing::error!("Failed to load games: {}", e);
        e.to_string()
    })?;

    let game_tasks = games
        .into_iter()
        .map(|game| {
            let igdb_provider = state.igdb_client.clone();
            let db_pool = db_pool.clone();

            async move {
                let metadata = match_game_igdb(igdb_provider.clone(), &game).await;

                let mut conn = match db_pool.get().await {
                    Ok(conn) => conn,
                    Err(why) => {
                        tracing::error!("Failed to get connection: {}", why);
                        return Err(why.to_string());
                    }
                };

                if let Some(metadata) = metadata {
                    if let Err(e) = diesel::insert_into(schema::game_metadata::table)
                        .values(&metadata)
                        .on_conflict_do_nothing()
                        .get_results::<retrom::GameMetadata>(&mut conn)
                        .await
                        .optional()
                    {
                        tracing::error!("Failed to insert metadata: {}", e);
                    };
                };

                Ok(())
            }
        })
        .collect();

    let all_game_metadata: Vec<GameMetadata> = match schema::game_metadata::table
        .load::<retrom::GameMetadata>(&mut conn)
        .await
    {
        Ok(metadata) => metadata,
        Err(e) => {
            tracing::error!("Failed to load metadata: {}", e);
            vec![]
        }
    };

    // keep a reference to a copy to read across all tasks
    // needed because the tasks are built from an iterator
    // of the original data
    let all_game_metadata_ref = Arc::new(all_game_metadata.clone());

    let extra_metadata_tasks = all_game_metadata
        .into_iter()
        .map(|game_meta| {
            let igdb_provider = state.igdb_client.clone();
            let db_pool = db_pool.clone();
            let all_game_metadata_clone = all_game_metadata_ref.clone();

            async move {
                let mut conn = match db_pool.get().await {
                    Ok(conn) => conn,
                    Err(why) => {
                        tracing::error!("Failed to get connection: {}", why);
                        return Err(why.to_string());
                    }
                };

                let game_igdb_id = match game_meta.igdb_id {
                    Some(id) => id,
                    None => return Err("Game has no IGDB ID".to_string()),
                };

                let query = format!(
                    "fields genres.*, similar_games.id, franchise.games.id, franchises.games.id; \
                    where id = {game_igdb_id};",
                );

                let res = match igdb_provider.make_request("games.pb".into(), query).await {
                    Ok(res) => res,
                    Err(e) => return Err(e.to_string()),
                };

                let bytes = match res.bytes().await {
                    Ok(bytes) => bytes,
                    Err(e) => return Err(e.to_string()),
                };

                let extra_metadata = match igdb::GameResult::decode(bytes) {
                    Ok(metadata) => metadata,
                    Err(e) => {
                        tracing::error!("Failed to parse IGDB response: {}", e);
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
                        let similar_game_id = all_game_metadata_clone
                            .iter()
                            .find(|metadata| metadata.igdb_id == id.to_i64())
                            .map(|metadata| metadata.game_id)?;

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

                diesel::insert_into(schema::similar_game_maps::table)
                    .values(&new_similar_game_maps)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to insert similar games: {}", e);
                        e.to_string()
                    })?;

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

                diesel::insert_into(schema::game_genres::table)
                    .values(&new_genres)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to insert genres: {}", e);
                        e.to_string()
                    })?;

                let genres: Vec<GameGenre> = schema::game_genres::table
                    .filter(
                        schema::game_genres::slug
                            .eq_any(new_genres.iter().map(|genre| &genre.slug)),
                    )
                    .load(&mut conn)
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to load genres: {}", e);
                        e.to_string()
                    })?;

                let new_genre_maps = genres
                    .into_iter()
                    .map(|genre| NewGameGenreMap {
                        game_id: game_meta.game_id,
                        genre_id: genre.id,
                        ..Default::default()
                    })
                    .collect::<Vec<_>>();

                diesel::insert_into(schema::game_genre_maps::table)
                    .values(&new_genre_maps)
                    .on_conflict_do_nothing()
                    .execute(&mut conn)
                    .await
                    .map_err(|e| {
                        tracing::error!("Failed to insert genre maps: {}", e);
                        e.to_string()
                    })?;

                Ok(())
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
    })
}
