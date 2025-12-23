use crate::saves::v2::ludusavi_manager::LudusaviManager;
use diesel::{query_dsl::methods::FilterDsl, ExpressionMethods};
use diesel_async::RunQueryDsl;
use ludusavi::report::ApiGame;
use retrom_codegen::retrom::{
    services::saves::v2::{
        emulator_saves_service_server::EmulatorSavesService, Backup,
        RestoreSaveFilesFromBackupRequest, RestoreSaveFilesFromBackupResponse,
        RestoreSaveStatesFromBackupRequest, RestoreSaveStatesFromBackupResponse, SaveFilesStat,
        StatSaveFilesRequest, StatSaveFilesResponse, StatSaveStatesRequest, StatSaveStatesResponse,
    },
    Emulator,
};
use retrom_db::Pool;
use std::{path::PathBuf, sync::Arc, time::SystemTime};
use tonic::{Request, Response, Status};
use tracing::instrument;

pub struct EmulatorSavesServiceHandlers {
    db_pool: Arc<Pool>,
}

impl EmulatorSavesServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl EmulatorSavesService for EmulatorSavesServiceHandlers {
    #[instrument(skip(self))]
    async fn stat_save_files(
        &self,
        request: Request<StatSaveFilesRequest>,
    ) -> Result<Response<StatSaveFilesResponse>, Status> {
        let request = request.into_inner();
        let include_backups = request.config.map(|c| c.include_backups()).unwrap_or(false);

        let emulator_ids = request
            .save_files_selectors
            .iter()
            .map(|selector| selector.emulator_id)
            .collect::<Vec<_>>();

        let emulators: Vec<Emulator> = {
            use retrom_db::schema::emulators;

            let mut conn = self
                .db_pool
                .get()
                .await
                .map_err(|e| Status::internal(format!("Failed to get DB connection: {}", e)))?;

            emulators::table
                .filter(emulators::id.eq_any(&emulator_ids))
                .load(&mut conn)
                .await
                .map_err(|e| Status::internal(format!("Failed to load emulators: {}", e)))?
        };

        let mut ludusavi_manager = LudusaviManager::new(&emulators);
        let files = ludusavi_manager.list_files().map_err(|e| {
            Status::internal(format!("Failed to list save files via Ludusavi: {}", e))
        })?;

        let backups_output = if include_backups {
            Some(ludusavi_manager.list_backups(None).map_err(|e| {
                Status::internal(format!("Failed to list save file backups: {}", e))
            })?)
        } else {
            None
        };

        let save_files_stats: Vec<SaveFilesStat> = files
            .into_iter()
            .map(|(emulator_id, files)| {
                let file_stats = files
                    .into_keys()
                    .filter_map(|fname| PathBuf::from(fname).try_into().ok())
                    .collect();

                let backups = backups_output
                    .as_ref()
                    .and_then(|output| {
                        let stored = output.games.get(&emulator_id.to_string())?;

                        let ludusavi_backups = match stored {
                            ApiGame::Stored { backups, .. } => backups,
                            _ => return None,
                        };

                        let backups: Vec<Backup> = ludusavi_backups
                            .iter()
                            .map(|b| {
                                let created_at: SystemTime = b.when.into();

                                Backup {
                                    backup_id: b.name.clone(),
                                    created_at: Some(created_at.into()),
                                }
                            })
                            .collect();

                        Some(backups)
                    })
                    .unwrap_or_default();

                SaveFilesStat {
                    emulator_id,
                    file_stats,
                    backups,
                    etag: Default::default(),
                }
            })
            .collect();

        Ok(Response::new(StatSaveFilesResponse { save_files_stats }))
    }

    #[instrument(skip(self))]
    async fn restore_save_files_from_backup(
        &self,
        _request: Request<RestoreSaveFilesFromBackupRequest>,
    ) -> Result<Response<RestoreSaveFilesFromBackupResponse>, Status> {
        unimplemented!()
    }

    #[instrument(skip(self))]
    async fn stat_save_states(
        &self,
        _request: Request<StatSaveStatesRequest>,
    ) -> Result<Response<StatSaveStatesResponse>, Status> {
        unimplemented!()
    }

    #[instrument(skip(self))]
    async fn restore_save_states_from_backup(
        &self,
        _request: Request<RestoreSaveStatesFromBackupRequest>,
    ) -> Result<Response<RestoreSaveStatesFromBackupResponse>, Status> {
        unimplemented!()
    }
}
