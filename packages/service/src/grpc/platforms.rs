use crate::media_cache::cacheable_media::CacheableMetadata;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use futures::future::join_all;
use retrom_codegen::retrom::{
    self, platform_service_server::PlatformService, DeletePlatformsRequest,
    DeletePlatformsResponse, GameFile, GameMetadata, GetPlatformsRequest, GetPlatformsResponse,
    PlatformMetadata, UpdatePlatformsRequest, UpdatePlatformsResponse,
};
use retrom_db::{schema, Pool};
use std::{path::PathBuf, sync::Arc};
use tonic::{Code, Request, Response, Status};

#[derive(Clone)]
pub struct PlatformServiceHandlers {
    pub db_pool: Arc<Pool>,
}

impl PlatformServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl PlatformService for PlatformServiceHandlers {
    async fn get_platforms(
        &self,
        request: Request<GetPlatformsRequest>,
    ) -> Result<Response<GetPlatformsResponse>, Status> {
        let request = request.into_inner();
        let ids = &request.ids;
        let with_metadata = request.with_metadata();
        let with_deleted = request.include_deleted();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut query = schema::platforms::table
            .into_boxed()
            .select(retrom::Platform::as_select());

        if !ids.is_empty() {
            query = query.filter(schema::platforms::id.eq_any(ids));
        }

        if !with_deleted {
            query = query.filter(schema::platforms::is_deleted.eq(false));
        }

        let platforms: Vec<retrom::Platform> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let metadata = match with_metadata {
            true => {
                let mut query = schema::platform_metadata::table
                    .into_boxed()
                    .select(retrom::PlatformMetadata::as_select());

                if !ids.is_empty() {
                    query = query.filter(schema::platform_metadata::platform_id.eq_any(ids));
                }

                let metadata: Vec<retrom::PlatformMetadata> = match query.load(&mut conn).await {
                    Ok(rows) => rows,
                    Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
                };

                metadata
            }
            false => vec![],
        };

        let response = GetPlatformsResponse {
            platforms,
            metadata,
        };

        Ok(Response::new(response))
    }

    async fn update_platforms(
        &self,
        request: Request<UpdatePlatformsRequest>,
    ) -> Result<Response<UpdatePlatformsResponse>, Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let to_update = request.platforms;
        let mut platforms_updated = Vec::new();

        for platform in to_update {
            let id = platform.id;

            if let Some(updated_path) = &platform.path {
                let current_platform = schema::platforms::table
                    .find(id)
                    .get_result::<retrom::Platform>(&mut conn)
                    .await;

                if let Ok(current_platform) = current_platform {
                    let old_path = PathBuf::from(&current_platform.path);
                    let mut new_path = PathBuf::from(updated_path);
                    let sanitized_fname = new_path
                        .file_name()
                        .and_then(|f| f.to_str())
                        .map(sanitize_filename::sanitize);

                    if let Some(sanitized_fname) = sanitized_fname {
                        new_path.set_file_name(sanitized_fname);
                    }

                    let is_rename = old_path != new_path;
                    let can_rename = old_path.exists() && !new_path.exists();
                    let safe_paths = old_path.parent() == new_path.parent();

                    if is_rename && can_rename && safe_paths {
                        if let Err(why) = tokio::fs::rename(&old_path, &new_path).await {
                            tracing::error!("Failed to rename platform directory: {}", why);

                            continue;
                        }

                        let games = schema::games::table
                            .filter(schema::games::platform_id.eq(id))
                            .get_results::<retrom::Game>(&mut conn)
                            .await
                            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                        for game in games {
                            let old_game_path = PathBuf::from(game.path);
                            let new_game_path = new_path.join(old_game_path.file_name().unwrap());

                            if !new_game_path.exists() {
                                tracing::error!(
                                    "File does not exist, did platform rename fail? - {:?}",
                                    new_game_path
                                );
                            }

                            let game_path = new_game_path
                                .canonicalize()
                                .ok()
                                .and_then(|p| p.to_str().map(|p| p.to_string()))
                                .unwrap();

                            diesel::update(
                                schema::games::table.filter(schema::games::id.eq(game.id)),
                            )
                            .set(schema::games::path.eq(game_path))
                            .execute(&mut conn)
                            .await
                            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                            let game_files = schema::game_files::table
                                .filter(schema::game_files::game_id.eq(game.id))
                                .load::<GameFile>(&mut conn)
                                .await
                                .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                            for game_file in game_files {
                                let old_game_path = old_game_path.clone();
                                let old_file_path = PathBuf::from(game_file.path);
                                let new_file_path = new_game_path
                                    .join(old_file_path.strip_prefix(old_game_path).unwrap());

                                if !new_file_path.exists() {
                                    tracing::error!(
                                        "File does not exist, did game rename fail? - {:?}",
                                        new_file_path
                                    );
                                }

                                let file_path = new_file_path
                                    .canonicalize()
                                    .ok()
                                    .and_then(|p| p.to_str().map(|p| p.to_string()))
                                    .unwrap();

                                diesel::update(
                                    schema::game_files::table
                                        .filter(schema::game_files::id.eq(game_file.id)),
                                )
                                .set(schema::game_files::path.eq(file_path))
                                .execute(&mut conn)
                                .await
                                .map_err(|why| Status::new(Code::Internal, why.to_string()))?;
                            }
                        }
                    } else {
                        tracing::info!("Skipping platform dir rename for platform {}", id);

                        continue;
                    }
                }

                let updated_platform =
                    diesel::update(schema::platforms::table.filter(schema::platforms::id.eq(id)))
                        .set(platform)
                        .get_result(&mut conn)
                        .await
                        .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                platforms_updated.push(updated_platform);
            }
        }

        let response = UpdatePlatformsResponse { platforms_updated };

        Ok(Response::new(response))
    }

    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        let request = request.into_inner();
        let delete_from_disk = request.delete_from_disk;
        let blacklist_entries = request.blacklist_entries;

        {
            let mut conn = match self.db_pool.get().await {
                Ok(conn) => conn,
                Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
            };

            let platforms: Vec<retrom::Platform> = schema::platforms::table
                .filter(schema::platforms::id.eq_any(&request.ids))
                .load(&mut conn)
                .await
                .unwrap_or_default();

            let games: Vec<retrom::Game> = retrom::Game::belonging_to(&platforms)
                .load(&mut conn)
                .await
                .unwrap_or_default();

            let platform_metadata: Vec<retrom::PlatformMetadata> =
                PlatformMetadata::belonging_to(&platforms)
                    .load(&mut conn)
                    .await
                    .unwrap_or_default();

            let game_metadata: Vec<GameMetadata> = GameMetadata::belonging_to(&games)
                .load(&mut conn)
                .await
                .unwrap_or_default();

            drop(conn);

            join_all(platform_metadata.iter().map(|m| m.clean_cache())).await;
            join_all(game_metadata.iter().map(|m| m.clean_cache())).await;
        }

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let platforms_deleted: Vec<retrom::Platform> = match blacklist_entries {
            true => {
                let games_deleted = diesel::update(
                    schema::games::table.filter(schema::games::platform_id.eq_any(&request.ids)),
                )
                .set((
                    schema::games::is_deleted.eq(true),
                    schema::games::deleted_at.eq(diesel::dsl::now),
                ))
                .get_results::<retrom::Game>(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                diesel::update(schema::game_files::table.filter(
                    schema::game_files::game_id.eq_any(games_deleted.iter().map(|g| g.id)),
                ))
                .set((
                    schema::game_files::is_deleted.eq(true),
                    schema::game_files::deleted_at.eq(diesel::dsl::now),
                ))
                .execute(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                diesel::update(
                    schema::platforms::table
                        .filter(schema::platforms::id.eq_any(&request.ids))
                        .filter(schema::platforms::third_party.eq(false)),
                )
                .set((
                    schema::platforms::is_deleted.eq(true),
                    schema::platforms::deleted_at.eq(diesel::dsl::now),
                ))
                .get_results(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?
            }
            false => {
                diesel::delete(
                    schema::games::table.filter(schema::games::platform_id.eq_any(&request.ids)),
                )
                .execute(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                diesel::delete(
                    schema::platforms::table
                        .filter(schema::platforms::id.eq_any(&request.ids))
                        .filter(schema::platforms::third_party.eq(false)),
                )
                .get_results(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?
            }
        };

        if delete_from_disk {
            for platform in &platforms_deleted {
                let platform_path = PathBuf::from(&platform.path);

                if platform_path.exists() {
                    if let Err(why) = tokio::fs::remove_dir_all(&platform_path).await {
                        tracing::error!("Failed to delete platform directory: {}", why);
                    }
                }
            }
        }

        let response = DeletePlatformsResponse { platforms_deleted };

        Ok(Response::new(response))
    }
}
