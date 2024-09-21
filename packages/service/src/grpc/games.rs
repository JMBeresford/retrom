use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    self, game_service_server::GameService, DeleteGamesRequest, DeleteGamesResponse, Game,
    GameFile, GetGamesRequest, GetGamesResponse, StorageType,
};
use retrom_db::{schema, Pool};
use std::{path::PathBuf, sync::Arc};
use tonic::{Code, Request, Response, Status};

#[derive(Debug, Clone)]
pub struct GameServiceHandlers {
    pub db_pool: Arc<Pool>,
}

impl GameServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl GameService for GameServiceHandlers {
    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        let request = request.into_inner();
        let include_deleted = request.include_deleted();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut query = schema::games::table
            .into_boxed()
            .select(retrom::Game::as_select());

        if !&request.ids.is_empty() {
            query = query.filter(schema::games::id.eq_any(&request.ids));
        }

        if !include_deleted {
            query = query.filter(schema::games::is_deleted.eq(false));
        }

        if !&request.platform_ids.is_empty() {
            query = query.filter(schema::games::platform_id.eq_any(&request.platform_ids));
        }

        let games_data: Vec<retrom::Game> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut metadata_data: Vec<retrom::GameMetadata> = vec![];
        let mut game_files_data: Vec<retrom::GameFile> = vec![];

        let game_ids: Vec<i32> = games_data.iter().map(|game| game.id).collect();

        if request.with_metadata() {
            let metadata_rows = schema::game_metadata::table
                .filter(schema::game_metadata::game_id.eq_any(&game_ids))
                .load::<retrom::GameMetadata>(&mut conn)
                .await;

            match metadata_rows {
                Ok(rows) => metadata_data.extend(rows),
                Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
            };
        }

        if request.with_files() {
            let mut query = schema::game_files::table
                .into_boxed()
                .filter(schema::game_files::game_id.eq_any(&game_ids));

            if !include_deleted {
                query = query.filter(schema::game_files::is_deleted.eq(false));
            }

            let game_files_rows = query.load::<retrom::GameFile>(&mut conn).await;

            match game_files_rows {
                Ok(rows) => {
                    game_files_data.extend(rows.into_iter().collect::<Vec<retrom::GameFile>>())
                }
                Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
            };
        }

        let response = GetGamesResponse {
            games: games_data,
            metadata: metadata_data,
            game_files: game_files_data,
        };

        Ok(Response::new(response))
    }

    async fn delete_games(
        &self,
        request: Request<DeleteGamesRequest>,
    ) -> Result<Response<DeleteGamesResponse>, Status> {
        let request = request.into_inner();
        let delete_from_disk = request.delete_from_disk;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let games_deleted: Vec<Game> = match delete_from_disk {
            false => {
                diesel::update(schema::games::table.filter(schema::games::id.eq_any(&request.ids)))
                    .set((
                        schema::games::is_deleted.eq(true),
                        schema::games::deleted_at.eq(diesel::dsl::now),
                    ))
                    .get_results(&mut conn)
                    .await
                    .map_err(|why| Status::new(Code::Internal, why.to_string()))?
            }
            true => {
                let id = request.ids.as_slice().first();

                if let Some(id) = id {
                    let game: Game = schema::games::table
                        .find(id)
                        .first(&mut conn)
                        .await
                        .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                    let path = PathBuf::from(&game.path);

                    if path.exists() {
                        if let Err(why) = tokio::fs::remove_dir_all(&path).await {
                            tracing::error!("Failed to delete game {} from disk: {}", id, why);
                        }
                    }
                }

                diesel::delete(schema::games::table.filter(schema::games::id.eq_any(&request.ids)))
                    .get_results(&mut conn)
                    .await
                    .map_err(|why| Status::new(Code::Internal, why.to_string()))?
            }
        };

        let response = DeleteGamesResponse { games_deleted };

        Ok(Response::new(response))
    }

    #[tracing::instrument(skip_all)]
    async fn update_games(
        &self,
        request: Request<retrom::UpdateGamesRequest>,
    ) -> Result<Response<retrom::UpdateGamesResponse>, Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let to_update = request.games;
        let mut games_updated = Vec::new();

        for mut game in to_update {
            let id = game.id;

            if let Some(updated_path) = game.path.clone() {
                let current_game: Result<Game, _> =
                    schema::games::table.find(id).first(&mut conn).await;

                if let Ok(current_game) = current_game {
                    let old_path = PathBuf::from(current_game.path);
                    let mut new_game_path = PathBuf::from(updated_path);
                    let sanitized_fname = new_game_path
                        .file_name()
                        .and_then(|os_str| os_str.to_str())
                        .map(sanitize_filename::sanitize);

                    if let Some(sanitized_fname) = sanitized_fname {
                        new_game_path.set_file_name(&sanitized_fname);
                        game.path = Some(new_game_path.to_str().unwrap().to_string());
                    }

                    let is_rename = old_path.file_name() != new_game_path.file_name();
                    let can_rename = old_path.exists() && !new_game_path.exists();
                    let paths_safe = old_path.parent() == new_game_path.parent();

                    if is_rename && can_rename && paths_safe {
                        if let Err(why) = tokio::fs::rename(&old_path, &new_game_path).await {
                            tracing::error!("Failed to rename file: {}", why);

                            continue;
                        }

                        let game_files = schema::game_files::table
                            .filter(schema::game_files::game_id.eq(id))
                            .load::<GameFile>(&mut conn)
                            .await
                            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                        let storage_type = StorageType::try_from(current_game.storage_type).ok();

                        for game_file in game_files {
                            let old_file_path = PathBuf::from(game_file.path);
                            let new_file_path = match storage_type {
                                Some(StorageType::SingleFileGame) => new_game_path.clone(),
                                Some(StorageType::MultiFileGame) => {
                                    new_game_path.join(old_file_path.file_name().unwrap())
                                }
                                None => {
                                    tracing::error!("Storage type not found for game {}", game.id);

                                    break;
                                }
                            };

                            if !new_file_path.exists() {
                                tracing::error!(
                                    "File does not exist, did game rename fail? - {:?}",
                                    new_file_path
                                );
                            }

                            let path = new_file_path
                                .canonicalize()
                                .ok()
                                .and_then(|p| p.to_str().map(|p| p.to_string()))
                                .unwrap();

                            diesel::update(
                                schema::game_files::table
                                    .filter(schema::game_files::id.eq(game_file.id)),
                            )
                            .set(schema::game_files::path.eq(path))
                            .execute(&mut conn)
                            .await
                            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;
                        }
                    } else {
                        tracing::info!("Skipping game dir rename for game {}", game.id);

                        continue;
                    }
                }
            }

            let updated_game =
                diesel::update(schema::games::table.filter(schema::games::id.eq(id)))
                    .set(game)
                    .get_result(&mut conn)
                    .await
                    .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

            games_updated.push(updated_game);
        }

        let response = retrom::UpdateGamesResponse { games_updated };

        Ok(Response::new(response))
    }

    #[tracing::instrument(skip(self, request), fields(request = ?request))]
    async fn delete_game_files(
        &self,
        request: Request<retrom::DeleteGameFilesRequest>,
    ) -> Result<Response<retrom::DeleteGameFilesResponse>, Status> {
        let request = request.into_inner();
        let delete_from_disk = request.delete_from_disk;

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let game_files_deleted: Vec<GameFile> = match delete_from_disk {
            true => {
                let current_files: Vec<(String, i32)> = schema::game_files::table
                    .filter(schema::game_files::id.eq_any(&request.ids))
                    .select((schema::game_files::path, schema::game_files::id))
                    .load::<(String, i32)>(&mut conn)
                    .await
                    .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

                for (path, id) in current_files {
                    let path = PathBuf::from(path);

                    if path.exists() {
                        if let Err(why) = tokio::fs::remove_file(&path).await {
                            tracing::error!("Failed to delete file {} from disk: {}", id, why);
                        }
                    }
                }

                diesel::delete(
                    schema::game_files::table.filter(schema::game_files::id.eq_any(&request.ids)),
                )
                .get_results(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?
            }
            false => diesel::update(schema::game_files::table)
                .filter(schema::game_files::id.eq_any(&request.ids))
                .set((
                    schema::game_files::is_deleted.eq(true),
                    schema::game_files::deleted_at.eq(diesel::dsl::now),
                ))
                .get_results(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?,
        };

        let response = retrom::DeleteGameFilesResponse { game_files_deleted };

        Ok(Response::new(response))
    }

    #[tracing::instrument(skip(self, request))]
    async fn update_game_files(
        &self,
        request: Request<retrom::UpdateGameFilesRequest>,
    ) -> Result<Response<retrom::UpdateGameFilesResponse>, Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let to_update = request.game_files;
        let mut game_files_updated = Vec::new();

        for mut game_file in to_update {
            let id = game_file.id;

            if let Some(updated_path) = game_file.path.clone() {
                let current_file: Result<GameFile, _> =
                    schema::game_files::table.find(id).first(&mut conn).await;

                let mut new_file_path = PathBuf::from(updated_path);
                let sanitized_fname = new_file_path
                    .file_name()
                    .and_then(|os_str| os_str.to_str())
                    .map(sanitize_filename::sanitize);

                if let Some(sanitized_fname) = sanitized_fname {
                    new_file_path.set_file_name(&sanitized_fname);
                    game_file.path = Some(new_file_path.to_str().unwrap().to_string());
                }

                if let Ok(current_file) = current_file {
                    let old_path = PathBuf::from(current_file.path);

                    let is_rename = old_path.file_name() != new_file_path.file_name();
                    let can_rename = old_path.exists() && !new_file_path.exists();
                    let paths_safe = old_path.parent() == new_file_path.parent();

                    if is_rename && can_rename && paths_safe {
                        if let Err(why) = tokio::fs::rename(&old_path, &new_file_path).await {
                            tracing::error!("Failed to rename file: {}", why);

                            continue;
                        }
                    } else {
                        tracing::error!("Failed to rename file: {:?}: path error", game_file.id);

                        continue;
                    }
                }
            }

            let updated_game_file: GameFile =
                diesel::update(schema::game_files::table.filter(schema::game_files::id.eq(id)))
                    .set(game_file)
                    .get_result(&mut conn)
                    .await
                    .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

            let game_id = updated_game_file.game_id;

            let game: Game = schema::games::table
                .find(&game_id)
                .first(&mut conn)
                .await
                .expect("Could not find game entry for game file");

            if let Ok(StorageType::SingleFileGame) = StorageType::try_from(game.storage_type) {
                diesel::update(&game)
                    .set(schema::games::path.eq(&updated_game_file.path))
                    .execute(&mut conn)
                    .await
                    .expect("Could not update game path");
            }

            game_files_updated.push(updated_game_file);
        }

        let response = retrom::UpdateGameFilesResponse { game_files_updated };

        Ok(Response::new(response))
    }
}
