use crate::config::ServerConfigManager;
use diesel::query_dsl::methods::FindDsl;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    get_save_files_response::SaveFiles, saves_service_server::SavesService,
    update_save_files_response::NotUpdatedSaveFiles, DeleteSaveFilesRequest,
    DeleteSaveFilesResponse, DeleteSaveStatesRequest, DeleteSaveStatesResponse, Game,
    GetSaveFilesRequest, GetSaveFilesResponse, GetSaveStatesResponse,
    RestoreSaveFilesFromBackupRequest, RestoreSaveFilesFromBackupResponse,
    RestoreSaveStatesFromBackupRequest, RestoreSaveStatesFromBackupResponse, StatSaveFilesRequest,
    StatSaveFilesResponse, StatSaveStatesRequest, StatSaveStatesResponse, UpdateSaveFilesRequest,
    UpdateSaveFilesResponse, UpdateSaveStatesRequest, UpdateSaveStatesResponse,
};
use retrom_db::Pool;
use save_file_manager::{GameSaveFileManager, SaveFileManager};
use std::{path::PathBuf, sync::Arc};
use tracing::instrument;

pub mod save_file_manager;

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

            let save_files = save_file_manager
                .resolve_save_files(include_backups)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            response.save_files_stats.extend(save_files);
        }

        Ok(tonic::Response::new(response))
    }

    async fn stat_save_states(
        &self,
        request: tonic::Request<StatSaveStatesRequest>,
    ) -> Result<tonic::Response<StatSaveStatesResponse>, tonic::Status> {
        unimplemented!()
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

                for file_stat in save_file_stat.file_stats.into_iter() {
                    let file_path = PathBuf::from(&file_stat.path);
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

    async fn get_save_states(
        &self,
        request: tonic::Request<retrom_codegen::retrom::GetSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<GetSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn update_save_files(
        &self,
        request: tonic::Request<UpdateSaveFilesRequest>,
    ) -> std::result::Result<tonic::Response<UpdateSaveFilesResponse>, tonic::Status> {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;

        let mut response = UpdateSaveFilesResponse::default();

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

            let current_saves = save_file_manager
                .resolve_save_files(false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let save = SaveFiles {
                game_id,
                emulator_id: Some(emulator_id),
                files: selector.files,
            };

            let updated = save_file_manager
                .update_save_files(save, false)
                .await
                .map_err(|e| tonic::Status::internal(e.to_string()))?;

            let mut not_updated = NotUpdatedSaveFiles {
                game_id,
                emulator_id: Some(emulator_id),
                file_stats: vec![],
                ..Default::default()
            };

            for file_stat in current_saves
                .into_iter()
                .filter(|s| s.emulator_id == Some(emulator_id))
                .flat_map(|s| s.file_stats)
            {
                if !updated.file_stats.iter().any(|f| f.path == file_stat.path) {
                    not_updated.file_stats.push(file_stat);
                }
            }

            response.save_files_updated.push(updated);
            response.save_files_not_updated.push(not_updated);
        }

        Ok(tonic::Response::new(response))
    }

    async fn update_save_states(
        &self,
        request: tonic::Request<UpdateSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<UpdateSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn delete_save_files(
        &self,
        request: tonic::Request<DeleteSaveFilesRequest>,
    ) -> std::result::Result<tonic::Response<DeleteSaveFilesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn delete_save_states(
        &self,
        request: tonic::Request<DeleteSaveStatesRequest>,
    ) -> std::result::Result<tonic::Response<DeleteSaveStatesResponse>, tonic::Status> {
        unimplemented!()
    }

    async fn restore_save_files_from_backup(
        &self,
        request: tonic::Request<RestoreSaveFilesFromBackupRequest>,
    ) -> std::result::Result<tonic::Response<RestoreSaveFilesFromBackupResponse>, tonic::Status>
    {
        unimplemented!()
    }

    async fn restore_save_states_from_backup(
        &self,
        request: tonic::Request<RestoreSaveStatesFromBackupRequest>,
    ) -> std::result::Result<tonic::Response<RestoreSaveStatesFromBackupResponse>, tonic::Status>
    {
        unimplemented!()
    }
}
