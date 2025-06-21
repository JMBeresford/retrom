use crate::config::ServerConfigManager;
use diesel::query_dsl::methods::FindDsl;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    saves_service_server::SavesService, DeleteSaveFilesRequest, DeleteSaveFilesResponse,
    DeleteSaveStatesRequest, DeleteSaveStatesResponse, Game, GetSaveFilesRequest,
    GetSaveFilesResponse, GetSaveStatesResponse, RestoreSaveFilesFromBackupRequest,
    RestoreSaveFilesFromBackupResponse, RestoreSaveStatesFromBackupRequest,
    RestoreSaveStatesFromBackupResponse, SaveFiles, SaveStates, StatSaveFilesRequest,
    StatSaveFilesResponse, StatSaveStatesRequest, StatSaveStatesResponse, UpdateSaveFilesRequest,
    UpdateSaveFilesResponse, UpdateSaveStatesRequest, UpdateSaveStatesResponse,
};
use retrom_db::Pool;
use save_file_manager::{GameSaveFileManager, SaveFileManager};
use save_state_manager::{GameSaveStateManager, SaveStateManager};
use std::{path::PathBuf, sync::Arc};
use tracing::instrument;

pub mod save_file_manager;
pub mod save_state_manager;

pub struct SavesServiceHandlers {
    db_pool: Arc<Pool>,
    config_manager: Arc<ServerConfigManager>,
}

impl SavesServiceHandlers {
    pub fn new(db_pool: Arc<Pool>, config_manager: Arc<ServerConfigManager>) -> Self {
        Self {
            db_pool,
            config_manager,
        }
    }
}

#[tonic::async_trait]
impl SavesService for SavesServiceHandlers {
    #[instrument(skip_all)]
    async fn stat_save_files(
        &self,
        request: tonic::Request<StatSaveFilesRequest>,
    ) -> Result<tonic::Response<StatSaveFilesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;
        let include_backups = request
            .config
            .and_then(|c| c.include_backups)
            .unwrap_or(false);

        let mut response = StatSaveFilesResponse::default();

        for selector in selectors {
            let config = self.config_manager.clone();
            let db_pool = self.db_pool.clone();
            let game_id = selector.game_id;

            let mut conn = db_pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_file_manager = GameSaveFileManager::new(game, db_pool, config);

            let mut save_files = save_file_manager
                .resolve_save_files(include_backups)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            save_files.retain(|sf| sf.emulator_id == selector.emulator_id);

            response.save_files_stats.extend(save_files);
        }

        Ok(tonic::Response::new(response))
    }

    #[instrument(skip_all)]
    async fn stat_save_states(
        &self,
        request: tonic::Request<StatSaveStatesRequest>,
    ) -> Result<tonic::Response<StatSaveStatesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_states_selectors;
        let include_backups = request
            .config
            .and_then(|c| c.include_backups)
            .unwrap_or(false);

        let mut response = StatSaveStatesResponse::default();

        for selector in selectors {
            let config = self.config_manager.clone();
            let db_pool = self.db_pool.clone();
            let game_id = selector.game_id;

            let mut conn = db_pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_state_manager = GameSaveStateManager::new(game, db_pool, config);

            let mut save_states = save_state_manager
                .resolve_save_states(include_backups)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            save_states.retain(|sf| sf.emulator_id == selector.emulator_id);

            response.save_states_stats.extend(save_states);
        }

        Ok(tonic::Response::new(response))
    }

    #[instrument(skip_all)]
    async fn get_save_files(
        &self,
        request: tonic::Request<GetSaveFilesRequest>,
    ) -> Result<tonic::Response<GetSaveFilesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;

        let mut response = GetSaveFilesResponse::default();

        for selector in selectors {
            let config = self.config_manager.clone();
            let db_pool = self.db_pool.clone();
            let game_id = selector.game_id;
            let emulator_id = selector.emulator_id;

            let mut conn = db_pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_file_manager = GameSaveFileManager::new(game, db_pool, config);

            let save_files = save_file_manager
                .resolve_save_files(false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            for save_file_stat in save_files {
                if emulator_id.is_some() && save_file_stat.emulator_id != emulator_id {
                    continue;
                }

                let mut save = SaveFiles {
                    game_id,
                    emulator_id,
                    files: vec![],
                };

                let save_dir = save_file_manager
                    .get_saves_dir(emulator_id)
                    .map_err(|e| tonic::Status::internal(e.to_string()))?;

                for file_stat in save_file_stat.file_stats.into_iter() {
                    let relative_path = PathBuf::from(&file_stat.path);
                    if relative_path.is_absolute() {
                        return Err(tonic::Status::invalid_argument(
                            "File path must be relative",
                        ));
                    }

                    let file_path = save_dir.join(&relative_path);
                    if !file_path.is_file() {
                        continue;
                    }

                    let content = tokio::fs::read(&file_path)
                        .await
                        .map_err(|e| tonic::Status::internal(e.to_string()))?;

                    save.files.push(retrom_codegen::retrom::files::File {
                        content,
                        stat: Some(file_stat),
                    })
                }

                response.save_files.push(save);
            }
        }

        Ok(tonic::Response::new(response))
    }

    #[instrument(skip_all)]
    async fn get_save_states(
        &self,
        request: tonic::Request<retrom_codegen::retrom::GetSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<GetSaveStatesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_states_selectors;

        let mut response = GetSaveStatesResponse::default();

        for selector in selectors {
            let config = self.config_manager.clone();
            let db_pool = self.db_pool.clone();
            let game_id = selector.game_id;
            let emulator_id = selector.emulator_id;

            let mut conn = db_pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_state_manager = GameSaveStateManager::new(game, db_pool, config);

            let save_states = save_state_manager
                .resolve_save_states(false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let states_dir = save_state_manager
                .get_states_dir(emulator_id)
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            for save_states_stat in save_states {
                if emulator_id.is_some() && save_states_stat.emulator_id != emulator_id {
                    continue;
                }

                let mut states = SaveStates {
                    game_id,
                    emulator_id,
                    files: vec![],
                };

                for file_stat in save_states_stat.file_stats.into_iter() {
                    let relative_path = PathBuf::from(&file_stat.path);
                    if relative_path.is_absolute() {
                        return Err(tonic::Status::invalid_argument(
                            "File path must be relative",
                        ));
                    }

                    let file_path = states_dir.join(&relative_path);
                    if !file_path.is_file() {
                        continue;
                    }

                    let content = tokio::fs::read(&file_path)
                        .await
                        .map_err(|e| tonic::Status::internal(e.to_string()))?;

                    states.files.push(retrom_codegen::retrom::files::File {
                        content,
                        stat: Some(file_stat),
                    })
                }

                response.save_states.push(states);
            }
        }

        Ok(tonic::Response::new(response))
    }

    #[instrument(skip_all)]
    async fn update_save_files(
        &self,
        request: tonic::Request<UpdateSaveFilesRequest>,
    ) -> std::result::Result<tonic::Response<UpdateSaveFilesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;

        let response = UpdateSaveFilesResponse::default();

        for selector in selectors {
            let config = self.config_manager.clone();
            let db_pool = self.db_pool.clone();
            let game_id = selector.game_id;
            let emulator_id = match selector.emulator_id {
                Some(id) => id,
                _ => {
                    return Err(tonic::Status::invalid_argument(
                        "Emulator ID must be provided",
                    ))
                }
            };

            let mut conn = db_pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_file_manager = GameSaveFileManager::new(game, db_pool, config);

            let save = SaveFiles {
                game_id,
                emulator_id: Some(emulator_id),
                files: selector.files,
            };

            save_file_manager
                .update_save_files(save, false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;
        }

        Ok(tonic::Response::new(response))
    }

    #[instrument(skip_all)]
    async fn update_save_states(
        &self,
        request: tonic::Request<UpdateSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<UpdateSaveStatesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_states_selectors;

        let response = UpdateSaveStatesResponse::default();

        for selector in selectors {
            let config = self.config_manager.clone();
            let db_pool = self.db_pool.clone();
            let game_id = selector.game_id;
            let emulator_id = match selector.emulator_id {
                Some(id) => id,
                _ => {
                    return Err(tonic::Status::invalid_argument(
                        "Emulator ID must be provided",
                    ))
                }
            };

            let mut conn = db_pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_state_manager = GameSaveStateManager::new(game, db_pool, config);

            let states = SaveStates {
                game_id,
                emulator_id: Some(emulator_id),
                files: selector.files,
            };

            save_state_manager
                .update_save_states(states, false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;
        }

        Ok(tonic::Response::new(response))
    }

    #[instrument(skip_all)]
    async fn delete_save_files(
        &self,
        request: tonic::Request<DeleteSaveFilesRequest>,
    ) -> std::result::Result<tonic::Response<DeleteSaveFilesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;
        let config = request.config;
        let dry_run = config.as_ref().and_then(|c| c.dry_run).unwrap_or(false);

        let res = DeleteSaveFilesResponse::default();
        for selector in selectors {
            let game_id = selector.game_id;
            let pool = self.db_pool.clone();
            let mut conn = pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_file_manager =
                GameSaveFileManager::new(game, self.db_pool.clone(), self.config_manager.clone());

            save_file_manager
                .delete_save_files(selector.emulator_id, dry_run)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;
        }

        Ok(tonic::Response::new(res))
    }

    #[instrument(skip_all)]
    async fn delete_save_states(
        &self,
        request: tonic::Request<DeleteSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<DeleteSaveStatesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_states_selectors;
        let config = request.config;
        let dry_run = config.as_ref().and_then(|c| c.dry_run).unwrap_or(false);

        let res = DeleteSaveStatesResponse::default();
        for selector in selectors {
            let game_id = selector.game_id;
            let pool = self.db_pool.clone();
            let mut conn = pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_state_manager =
                GameSaveStateManager::new(game, self.db_pool.clone(), self.config_manager.clone());

            save_state_manager
                .delete_save_states(selector.emulator_id, selector.files, dry_run)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;
        }

        Ok(tonic::Response::new(res))
    }

    #[instrument(skip_all)]
    async fn restore_save_files_from_backup(
        &self,
        request: tonic::Request<RestoreSaveFilesFromBackupRequest>,
    ) -> std::result::Result<tonic::Response<RestoreSaveFilesFromBackupResponse>, tonic::Status>
    {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;
        let config = request.config;
        let dry_run = config.as_ref().and_then(|c| c.dry_run).unwrap_or(false);
        let reindex = config
            .as_ref()
            .and_then(|c| c.reindex_backups)
            .unwrap_or(false);

        let mut res = RestoreSaveFilesFromBackupResponse::default();
        for selector in selectors {
            let game_id = selector.game_id;
            let emulator_id = selector.emulator_id;
            let backup = match selector.backup {
                Some(backup) => backup,
                None => return Err(tonic::Status::invalid_argument("Backup must be provided")),
            };

            let pool = self.db_pool.clone();
            let mut conn = pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_file_manager =
                GameSaveFileManager::new(game, self.db_pool.clone(), self.config_manager.clone());

            save_file_manager
                .restore_save_files_from_backup(backup, reindex, emulator_id, dry_run)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let saves = save_file_manager
                .resolve_save_files(false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?
                .into_iter()
                .filter(|s| s.emulator_id == emulator_id)
                .collect::<Vec<_>>();

            let save = match saves.get(0) {
                Some(save) => save.clone(),
                None => {
                    return Err(tonic::Status::internal(
                        "No save files found after restoring backup",
                    ));
                }
            };

            let mut files = vec![];
            let save_dir_path = PathBuf::from(&save.save_path);

            for stat in save.file_stats {
                let path = save_dir_path.join(&stat.path);
                if !path.is_file() {
                    continue;
                } else {
                    tracing::info!("Skipping non-file path: {}", path.display());
                }

                let content = tokio::fs::read(&path)
                    .await
                    .map_err(|e| tonic::Status::internal(e.to_string()))?;

                files.push(retrom_codegen::retrom::files::File {
                    content,
                    stat: Some(stat),
                });
            }

            res.save_files.push(SaveFiles {
                game_id,
                emulator_id,
                files,
            });
        }

        Ok(tonic::Response::new(res))
    }

    #[instrument(skip_all)]
    async fn restore_save_states_from_backup(
        &self,
        request: tonic::Request<RestoreSaveStatesFromBackupRequest>,
    ) -> std::result::Result<tonic::Response<RestoreSaveStatesFromBackupResponse>, tonic::Status>
    {
        let request = request.into_inner();
        let selectors = request.save_states_selectors;
        let config = request.config;
        let dry_run = config.as_ref().and_then(|c| c.dry_run).unwrap_or(false);
        let reindex = config
            .as_ref()
            .and_then(|c| c.reindex_backups)
            .unwrap_or(false);

        let mut res = RestoreSaveStatesFromBackupResponse::default();
        for selector in selectors {
            let game_id = selector.game_id;
            let emulator_id = selector.emulator_id;
            let backup = match selector.backup {
                Some(backup) => backup,
                None => return Err(tonic::Status::invalid_argument("Backup must be provided")),
            };

            let pool = self.db_pool.clone();
            let mut conn = pool
                .get()
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let game = retrom_db::schema::games::table
                .find(game_id)
                .first::<Game>(&mut conn)
                .await
                .map_err(|e| {
                    tonic::Status::not_found(format!("Game with ID {game_id} not found: {e:#?}"))
                })?;

            drop(conn);

            let save_state_manager =
                GameSaveStateManager::new(game, self.db_pool.clone(), self.config_manager.clone());

            save_state_manager
                .restore_save_states_from_backup(backup, reindex, emulator_id, dry_run)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let all_states = save_state_manager
                .resolve_save_states(false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?
                .into_iter()
                .filter(|s| s.emulator_id == emulator_id)
                .collect::<Vec<_>>();

            let states = match all_states.get(0) {
                Some(states) => states.clone(),
                None => {
                    return Err(tonic::Status::internal(
                        "No save files found after restoring backup",
                    ));
                }
            };

            let mut files = vec![];
            let save_states_path = PathBuf::from(&states.states_path);

            for stat in states.file_stats {
                let path = save_states_path.join(&stat.path);
                if !path.is_file() {
                    continue;
                } else {
                    tracing::info!("Skipping non-file path: {}", path.display());
                }

                let content = tokio::fs::read(&path)
                    .await
                    .map_err(|e| tonic::Status::internal(e.to_string()))?;

                files.push(retrom_codegen::retrom::files::File {
                    content,
                    stat: Some(stat),
                });
            }

            res.save_states.push(SaveStates {
                game_id,
                emulator_id,
                files,
            });
        }

        Ok(tonic::Response::new(res))
    }
}
