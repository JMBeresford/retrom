use crate::saves::v2::ludusavi_manager::LudusaviManager;
use diesel::{query_dsl::methods::FilterDsl, ExpressionMethods};
use diesel_async::RunQueryDsl;
use futures::future::join_all;
use ludusavi::{
    api::{parameters::ListBackups, ApiOutput},
    report::ApiGame,
};
use retrom_codegen::retrom::{
    files::FileStat,
    services::saves::v2::{
        emulator_saves_service_server::EmulatorSavesService, Backup, BackupSaveFilesRequest,
        BackupSaveFilesResponse, BackupSaveStatesRequest, BackupSaveStatesResponse,
        RestoreSaveFilesFromBackupRequest, RestoreSaveFilesFromBackupResponse,
        RestoreSaveStatesFromBackupRequest, RestoreSaveStatesFromBackupResponse, SaveFilesStat,
        StatSaveFilesRequest, StatSaveFilesResponse, StatSaveStatesRequest, StatSaveStatesResponse,
    },
    Emulator,
};
use retrom_db::Pool;
use retrom_service_common::retrom_dirs::RetromDirs;
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
        let (files, backups_output) = tokio::task::spawn_blocking(move || {
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

            Ok::<_, Status>((files, backups_output))
        })
        .await
        .map_err(|e| {
            Status::internal(format!("Failed to join Ludusavi list files task: {}", e))
        })??;

        let saves_root = RetromDirs::new().saves_dir();

        let save_files_stats: Vec<SaveFilesStat> = files
            .into_iter()
            .map(|(emulator_id, files)| {
                let emulator_save_dir = saves_root.join(emulator_id.to_string());

                let file_stats = files
                    .into_keys()
                    .filter_map(|fname| PathBuf::from(fname).try_into().ok())
                    .filter_map(|stat: FileStat| stat.relative_to(&emulator_save_dir))
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

                let save_directory = emulator_save_dir.to_string_lossy().to_string();

                SaveFilesStat {
                    emulator_id,
                    file_stats,
                    backups,
                    save_directory,
                }
            })
            .collect();

        Ok(Response::new(StatSaveFilesResponse { save_files_stats }))
    }

    #[instrument(skip(self))]
    async fn backup_save_files(
        &self,
        request: Request<BackupSaveFilesRequest>,
    ) -> Result<Response<BackupSaveFilesResponse>, Status> {
        let request = request.into_inner();
        let dry_run = request.config.map(|c| c.dry_run());

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
        tokio::task::spawn_blocking(move || {
            let output = ludusavi_manager.back_up(dry_run).map_err(|e| {
                Status::internal(format!("Failed to back up save files via Ludusavi: {}", e))
            })?;

            Ok::<_, Status>(output)
        })
        .await
        .map_err(|e| Status::internal(format!("Failed to join Ludusavi backup task: {}", e)))??;

        Ok(Response::new(BackupSaveFilesResponse::default()))
    }

    #[instrument(skip(self))]
    async fn restore_save_files_from_backup(
        &self,
        request: Request<RestoreSaveFilesFromBackupRequest>,
    ) -> Result<Response<RestoreSaveFilesFromBackupResponse>, Status> {
        let request = request.into_inner();
        let selectors = request.save_files_selectors;
        let dry_run = request.config.and_then(|c| c.dry_run);

        let emulator_ids: Vec<i32> = selectors.iter().map(|s| s.emulator_id).collect();

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

        let restore_jobs = selectors
            .into_iter()
            .map(|selector| {
                let backup_id = selector.backup.map(|b| b.backup_id);

                let mut ludusavi_manager = LudusaviManager::new(emulators.as_slice());
                tokio::task::spawn_blocking(move || ludusavi_manager.restore(backup_id, dry_run))
            })
            .collect::<Vec<_>>();

        let results = join_all(restore_jobs).await;

        results.into_iter().for_each(|res| {
            if let Err(e) = res {
                tracing::error!("Failed to join Ludusavi restore task: {}", e);
            } else if let Ok(Err(e)) = res {
                tracing::error!("Failed to restore save files via Ludusavi: {}", e);
            }
        });

        Ok(Response::new(RestoreSaveFilesFromBackupResponse::default()))
    }

    #[instrument(skip(self))]
    async fn stat_save_states(
        &self,
        _request: Request<StatSaveStatesRequest>,
    ) -> Result<Response<StatSaveStatesResponse>, Status> {
        unimplemented!()
    }

    #[instrument(skip(self))]
    async fn backup_save_states(
        &self,
        _request: Request<BackupSaveStatesRequest>,
    ) -> Result<Response<BackupSaveStatesResponse>, Status> {
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
