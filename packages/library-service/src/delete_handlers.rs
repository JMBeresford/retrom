use crate::handlers::LibraryServiceHandlers;
use diesel::{BelongingToDsl, ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
use futures::future::join_all;
use retrom_codegen::retrom::{
    DeleteLibraryRequest, DeleteLibraryResponse, DeleteMissingEntriesRequest,
    DeleteMissingEntriesResponse, Game, GameFile, GameMetadata, Platform, PlatformMetadata,
};
use retrom_db::schema;
use retrom_service_common::media_cache::cacheable_media::CacheableMetadata;
use std::{collections::HashSet, path::PathBuf, str::FromStr};
use tonic::Status;
use tracing::error;

pub async fn delete_library(
    state: &LibraryServiceHandlers,
    _request: DeleteLibraryRequest,
) -> Result<DeleteLibraryResponse, Status> {
    let mut conn = match state.db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::internal(why.to_string())),
    };

    match conn
        .transaction(|conn| {
            async move {
                let platform_metadata: Vec<PlatformMetadata> =
                    retrom_db::schema::platform_metadata::table
                        .load(conn)
                        .await
                        .unwrap_or_default();

                let game_metadata: Vec<GameMetadata> = retrom_db::schema::game_metadata::table
                    .load(conn)
                    .await
                    .unwrap_or_default();

                join_all(platform_metadata.iter().map(|m| m.clean_cache())).await;
                join_all(game_metadata.iter().map(|m| m.clean_cache())).await;

                diesel::delete(retrom_db::schema::platforms::table)
                    .filter(retrom_db::schema::platforms::third_party.eq(false))
                    .execute(conn)
                    .await?;

                // Delete orphaned games ( games not associated with any platform )
                diesel::delete(retrom_db::schema::games::table)
                    .execute(conn)
                    .await?;

                Ok::<(), diesel::result::Error>(())
            }
            .scope_boxed()
        })
        .await
    {
        Ok(_) => Ok(DeleteLibraryResponse {}),
        Err(why) => {
            error!("Failed to delete library: {}", why);
            Err(Status::internal(why.to_string()))
        }
    }
}

pub async fn delete_missing_entries(
    state: &LibraryServiceHandlers,
    request: DeleteMissingEntriesRequest,
) -> Result<DeleteMissingEntriesResponse, Status> {
    let mut conn = match state.db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::internal(why.to_string())),
    };

    match conn
        .transaction(|conn| {
            async move {
                let mut platforms_deleted = HashSet::new();
                let mut games_deleted = HashSet::new();
                let mut game_files_deleted = HashSet::new();

                let platforms: Vec<Platform> = schema::platforms::table
                    .filter(schema::platforms::third_party.eq(false))
                    .load(conn)
                    .await?;

                for platform in platforms {
                    let path = match PathBuf::from_str(&platform.path) {
                        Ok(path) => path,
                        _ => {
                            tracing::warn!(
                                "Could not parse platform path: id: {}, path: {}",
                                platform.id,
                                platform.path,
                            );
                            continue;
                        }
                    };

                    match path.try_exists() {
                        Ok(true) => continue,
                        Ok(false) => {
                            platforms_deleted.insert(platform);
                        }
                        Err(why) => {
                            tracing::warn!("Failed to check if path exists: {}", why);
                            continue;
                        }
                    }
                }

                let games_of_platforms: Vec<Game> = schema::games::table
                    .filter(
                        schema::games::platform_id
                            .eq_any(platforms_deleted.iter().map(|p| p.id).collect::<Vec<_>>()),
                    )
                    .load(conn)
                    .await?;

                games_deleted.extend(games_of_platforms.into_iter());

                let games: Vec<Game> = schema::games::table
                    .filter(schema::games::third_party.eq(false))
                    .load(conn)
                    .await?;

                for game in games {
                    let path = match PathBuf::from_str(&game.path) {
                        Ok(path) => path,
                        _ => {
                            tracing::warn!(
                                "Could not parse game path: id: {}, path: {}",
                                game.id,
                                game.path,
                            );
                            continue;
                        }
                    };

                    match path.try_exists() {
                        Ok(true) => continue,
                        Ok(false) => {
                            games_deleted.insert(game);
                        }
                        Err(why) => {
                            tracing::warn!("Failed to check if path exists: {}", why);
                            continue;
                        }
                    }
                }

                game_files_deleted.extend(
                    GameFile::belonging_to(&games_deleted.iter().collect::<Vec<_>>())
                        .select(GameFile::as_select())
                        .load(conn)
                        .await?
                        .into_iter(),
                );

                let game_files: Vec<GameFile> = schema::game_files::table.load(conn).await?;
                for game_file in game_files {
                    let path = match PathBuf::from_str(&game_file.path) {
                        Ok(path) => path,
                        _ => {
                            tracing::warn!(
                                "Could not parse game file path: id: {}, path: {}",
                                game_file.id,
                                game_file.path,
                            );
                            continue;
                        }
                    };

                    match path.try_exists() {
                        Ok(true) => continue,
                        Ok(false) => {
                            game_files_deleted.insert(game_file);
                        }
                        Err(why) => {
                            tracing::warn!("Failed to check if path exists: {}", why);
                            continue;
                        }
                    }
                }

                if !request.dry_run {
                    diesel::delete(schema::platforms::table)
                        .filter(
                            schema::platforms::id
                                .eq_any(platforms_deleted.iter().map(|p| p.id).collect::<Vec<_>>()),
                        )
                        .execute(conn)
                        .await?;

                    diesel::delete(schema::games::table)
                        .filter(
                            schema::games::id
                                .eq_any(games_deleted.iter().map(|g| g.id).collect::<Vec<_>>()),
                        )
                        .execute(conn)
                        .await?;

                    diesel::delete(schema::game_files::table)
                        .filter(
                            schema::game_files::id.eq_any(
                                game_files_deleted.iter().map(|f| f.id).collect::<Vec<_>>(),
                            ),
                        )
                        .execute(conn)
                        .await?;
                }

                Ok::<_, diesel::result::Error>(DeleteMissingEntriesResponse {
                    platforms_deleted: platforms_deleted.into_iter().collect(),
                    games_deleted: games_deleted.into_iter().collect(),
                    game_files_deleted: game_files_deleted.into_iter().collect(),
                })
            }
            .scope_boxed()
        })
        .await
    {
        Ok(res) => Ok(res),
        Err(why) => {
            error!("Failed to delete library: {}", why);
            Err(Status::internal(why.to_string()))
        }
    }
}
