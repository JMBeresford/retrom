use std::{path::PathBuf, sync::Arc};

use diesel::{ExpressionMethods, PgArrayExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    files::FileStat, get_save_files_response::SaveFiles, stat_save_files_response::SaveFilesStat,
    update_save_files_response::UpdatedSaveFiles, BackupStats, Emulator, Game,
};
use retrom_db::Pool;
use tracing::instrument;
use walkdir::WalkDir;

use crate::{config::ServerConfigManager, meta::RetromDirs};

#[derive(thiserror::Error, Debug)]
pub enum SaveFileManagerError {
    #[error("SaveFileManagerError: {0}")]
    InvalidArgument(String),
    #[error("SaveFileManagerError: {0}")]
    Internal(String),

    #[error("DB Error: {0}")]
    Diesel(#[from] diesel::result::Error),

    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),
}

type Result<T> = std::result::Result<T, SaveFileManagerError>;

pub struct GameSaveFileManager {
    game: Game,
    db_pool: Arc<Pool>,
    config: Arc<ServerConfigManager>,
}

impl GameSaveFileManager {
    pub fn new(game: Game, db_pool: Arc<Pool>, config: Arc<ServerConfigManager>) -> Self {
        Self {
            game,
            db_pool,
            config,
        }
    }
}

pub trait SaveFileManager {
    async fn resolve_save_files(&self, include_backups: bool) -> Result<Vec<SaveFilesStat>>;

    async fn reindex_backups(&self, emulator_id: Option<i32>) -> Result<()>;

    async fn backup_save_files(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveFilesStat>>;

    async fn update_save_files(
        &self,
        save_files: SaveFiles,
        dry_run: bool,
    ) -> Result<UpdatedSaveFiles>;

    async fn delete_save_files(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveFilesStat>>;

    async fn restore_save_files_from_backup(
        &self,
        backup_index: i32,
        reindex: bool,
    ) -> Result<Vec<SaveFilesStat>>;
}

impl SaveFileManager for GameSaveFileManager {
    #[instrument(skip_all)]
    async fn resolve_save_files(&self, include_backups: bool) -> Result<Vec<SaveFilesStat>> {
        let mut conn = self.db_pool.get().await.map_err(|e| {
            SaveFileManagerError::Internal(format!("Failed to get DB connection: {e:#?}"))
        })?;

        use retrom_db::schema::{emulators, platforms};

        let platform_ids: Vec<i32> = platforms::table
            .filter(platforms::id.eq(self.game.platform_id()))
            .select(platforms::id)
            .load(&mut conn)
            .await?;

        let emulators: Vec<Emulator> = emulators::table
            .filter(emulators::supported_platforms.overlaps_with(platform_ids))
            .select(Emulator::as_select())
            .load(&mut conn)
            .await?;

        let saves_dir = RetromDirs::new().data_dir().join("saves");

        tokio::fs::create_dir_all(&saves_dir).await?;

        let emulator_dirs: Vec<PathBuf> = saves_dir
            .read_dir()?
            .filter_map(|d| Some(d.ok()?.path()))
            .filter(|d| {
                emulators
                    .iter()
                    .any(|emu| d.file_name().and_then(|s| s.to_str()) == Some(&emu.id.to_string()))
                    && d.is_dir()
            })
            .collect();

        let mut files = vec![];

        for emulator_dir in &emulator_dirs {
            let emulator_id = emulator_dir
                .file_name()
                .and_then(|s| s.to_str())
                .and_then(|s| s.parse::<i32>().ok());

            if !emulator_dir.exists() {
                tracing::debug!(
                    "Emulator directory {} does not exist, skipping",
                    emulator_dir.display()
                );

                continue;
            }

            let save_dir = emulator_dir.join(self.game.id.to_string());
            let backup_prefix = format!("__{}_backup_", self.game.id);

            let backup_dirs = emulator_dir
                .read_dir()?
                .filter_map(|d| Some(d.ok()?.path()))
                .filter(|p| p.is_dir())
                .filter(|p| {
                    p.file_name()
                        .and_then(|f| f.to_str())
                        .is_some_and(|s| s.starts_with(&backup_prefix))
                })
                .collect::<Vec<_>>();

            if save_dir.is_dir() {
                let file_stats: Vec<FileStat> = WalkDir::new(&save_dir)
                    .min_depth(1)
                    .into_iter()
                    .filter_map(|d| d.ok()?.into_path().try_into().ok())
                    .collect();

                let mut backups = vec![];
                if include_backups {
                    for backup_dir in &backup_dirs {
                        let backup_index = match backup_dir.file_name().and_then(|f| {
                            f.to_str()?
                                .strip_prefix(&backup_prefix)?
                                .parse::<i32>()
                                .ok()
                        }) {
                            Some(index) => index,
                            None => continue,
                        };

                        let backup_file_stats: Vec<FileStat> = WalkDir::new(backup_dir)
                            .min_depth(1)
                            .into_iter()
                            .filter_map(|d| d.ok()?.into_path().try_into().ok())
                            .collect();

                        let created_at = backup_dir
                            .metadata()
                            .ok()
                            .and_then(|m| m.created().ok())
                            .map(|t| t.into());

                        backups.push(BackupStats {
                            backup_index,
                            backup_file_stats,
                            created_at,
                            backup_path: backup_dir
                                .to_str()
                                .map(|s| s.to_string())
                                .expect("Failed to convert path to string"),
                        });
                    }
                }

                files.push(SaveFilesStat {
                    file_stats,
                    backups,
                    emulator_id,
                    game_id: self.game.id,
                    save_path: save_dir
                        .to_str()
                        .map(|s| s.to_string())
                        .expect("Failed to convert path to string"),
                });
            }
        }

        tracing::debug!(save_files.count = files.len(), "Resolved save files");

        Ok(files)
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn reindex_backups(&self, emulator_id: Option<i32>) -> Result<()> {
        let config = self.config.get_config().await;
        let max_backup_count = config.saves.map(|s| s.max_save_files_backups).unwrap_or(5);

        let mut current_save_files = self.resolve_save_files(true).await?;

        if let Some(emulator_id) = emulator_id {
            current_save_files.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        for save_files in current_save_files.iter_mut() {
            let backups = &mut save_files.backups;
            backups.sort_by(|a, b| a.backup_index.cmp(&b.backup_index));

            for backup in backups.iter_mut().rev() {
                let new_index = backup.backup_index + 1;
                if new_index > max_backup_count {
                    tracing::info!(
                        "Evicting oldest save file backup {} for game {}",
                        backup.backup_index,
                        self.game.id
                    );

                    tokio::fs::remove_dir_all(&backup.backup_path).await?;

                    continue;
                }

                backup.backup_index = new_index;

                let cur_dir = PathBuf::from(&backup.backup_path);
                let new_dir =
                    cur_dir.with_file_name(format!("__{}_backup_{}", self.game.id, new_index));

                if new_dir.exists() {
                    tracing::warn!(
                        "Backup directory {} already exists, creating ephemeral backup of the backup",
                            new_dir.display()
                    );

                    tokio::fs::rename(
                        &new_dir,
                        new_dir.with_file_name(format!(
                            "__ephemeral__{}",
                            new_dir.file_name().unwrap().to_str().unwrap()
                        )),
                    )
                    .await?;

                    continue;
                }

                if tokio::fs::rename(&cur_dir, &new_dir).await.is_err() {
                    tracing::error!(
                        "Failed to rename backup directory {} to {}",
                        cur_dir.display(),
                        new_dir.display()
                    );

                    continue;
                }
            }
        }

        Ok(())
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn backup_save_files(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveFilesStat>> {
        let mut all_save_files = self.resolve_save_files(false).await?;

        if let Some(emulator_id) = emulator_id {
            all_save_files.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        for save_files in all_save_files.iter_mut() {
            let save_path = PathBuf::from(&save_files.save_path);

            // 0th backup is the 'staged' backup,
            // it should only exist while preparing a backup and should be immediately renamed
            // via `reindex_backups` after the backup is staged.
            let backup_dir = save_path.with_file_name(format!("__{}_backup_0", self.game.id));

            if backup_dir.exists() {
                tracing::debug!(
                    "Backup staging directory {} already exists, removing",
                    backup_dir.display()
                );

                tokio::fs::remove_dir_all(&backup_dir).await?;
            }

            tokio::fs::create_dir_all(&backup_dir).await?;

            for file_stat in save_files.file_stats.iter_mut() {
                let src_path = PathBuf::from(&file_stat.path);
                let relative_path = src_path
                    .strip_prefix(&save_path)
                    .expect("Failed to strip prefix");

                let dest_path = backup_dir.join(relative_path);

                file_stat.path = dest_path
                    .to_str()
                    .map(|s| s.to_string())
                    .unwrap_or_default();

                if dry_run {
                    tracing::info!(
                        "Dry run: would copy {} to {}",
                        src_path.display(),
                        dest_path.display()
                    );

                    continue;
                }

                if !dest_path.parent().unwrap().exists() {
                    if let Err(e) = tokio::fs::create_dir_all(dest_path.parent().unwrap()).await {
                        tracing::error!(
                            "Failed to create directory {}: {:#?}",
                            dest_path.parent().unwrap().display(),
                            e
                        );
                        continue;
                    }
                }

                if src_path.is_file() {
                    if let Err(e) = tokio::fs::copy(&src_path, &dest_path).await {
                        tracing::error!(
                            "Failed to copy {} to {}: {:#?}",
                            src_path.display(),
                            dest_path.display(),
                            e
                        );
                    }
                }
            }

            self.reindex_backups(emulator_id).await?;
        }

        Ok(all_save_files)
    }

    #[instrument(skip_all, fields(game_id = self.game.id))]
    async fn update_save_files(
        &self,
        save_files: SaveFiles,
        dry_run: bool,
    ) -> Result<UpdatedSaveFiles> {
        let mut updated_files = UpdatedSaveFiles {
            emulator_id: save_files.emulator_id,
            game_id: self.game.id,
            file_stats: vec![],
        };

        self.backup_save_files(save_files.emulator_id, dry_run)
            .await?;

        for file in save_files.files {
            let file_stat = match file.stat {
                Some(stat) => stat,
                None => {
                    return Err(SaveFileManagerError::InvalidArgument(
                        "FileStat is required".to_string(),
                    ));
                }
            };

            let src_path = PathBuf::from(&file_stat.path);
            if src_path.is_absolute() {
                return Err(SaveFileManagerError::InvalidArgument(
                    "Source path must be relative".to_string(),
                ));
            }

            let mut save_dir = RetromDirs::new().data_dir().join("saves");

            if let Some(emulator_id) = save_files.emulator_id {
                save_dir = save_dir.join(emulator_id.to_string());
            } else {
                // TODO: add support for per-OS native game saves
                return Err(SaveFileManagerError::InvalidArgument(
                    "Emulator ID is required".to_string(),
                ));
            }

            save_dir = save_dir.join(self.game.id.to_string());

            let dest_path = if let Some(fname) = src_path.to_str().map(|s| s.to_string()) {
                save_dir.join(fname)
            } else {
                return Err(SaveFileManagerError::Internal(
                    "Failed to convert source path to string".to_string(),
                ));
            };

            if dry_run {
                tracing::info!(
                    "Dry run: would copy {} to {}",
                    src_path.display(),
                    dest_path.display()
                );
            } else {
                tokio::fs::create_dir_all(&save_dir).await?;

                tokio::fs::write(&dest_path, file.content).await?;
            }

            if let Ok(updated) = FileStat::try_from(dest_path) {
                updated_files.file_stats.push(updated);
            }
        }

        Ok(updated_files)
    }

    async fn delete_save_files(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveFilesStat>> {
        // Implement the logic to delete save files
        unimplemented!()
    }

    async fn restore_save_files_from_backup(
        &self,
        backup_index: i32,
        reindex: bool,
    ) -> Result<Vec<SaveFilesStat>> {
        // Implement the logic to restore save files from backup
        unimplemented!()
    }
}
