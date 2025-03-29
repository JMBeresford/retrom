use std::{path::PathBuf, sync::Arc};

use chrono::DateTime;
use diesel::{ExpressionMethods, PgArrayExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use futures::future::join_all;
use retrom_codegen::retrom::{
    files::FileStat, BackupStats, Emulator, Game, SaveFiles, SaveFilesStat,
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
    fn get_saves_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf>;
    fn get_saves_backup_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf>;

    async fn backup_save_files(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveFilesStat>>;

    async fn update_save_files(&self, save_files: SaveFiles, dry_run: bool) -> Result<()>;

    async fn delete_save_files(&self, emulator_id: Option<i32>, dry_run: bool) -> Result<()>;

    async fn restore_save_files_from_backup(
        &self,
        backup: BackupStats,
        reindex: bool,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<()>;
}

impl SaveFileManager for GameSaveFileManager {
    #[instrument(skip(self))]
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

        let mut files = vec![];

        for emulator_id in emulators.iter().map(|e| e.id) {
            let save_dir = self.get_saves_dir(Some(emulator_id))?;
            let backup_dir = self.get_saves_backup_dir(Some(emulator_id))?;

            let file_stats: Vec<FileStat> = if save_dir.exists() {
                WalkDir::new(&save_dir)
                    .min_depth(1)
                    .into_iter()
                    .filter_map(|d| d.ok()?.into_path().try_into().ok())
                    .filter_map(|mut fs: FileStat| {
                        let path = PathBuf::from(&fs.path)
                            .strip_prefix(&save_dir)
                            .ok()?
                            .to_str()?
                            .to_string();

                        fs.path = path;

                        Some(fs)
                    })
                    .collect()
            } else {
                vec![]
            };

            let mut backups = vec![];
            if include_backups {
                tokio::fs::create_dir_all(&backup_dir).await?;
                backups.extend(
                    backup_dir
                        .read_dir()?
                        .filter_map(|entry| entry.ok())
                        .filter_map(|entry| {
                            let backup_dir = entry.path();
                            let backup_path = backup_dir.file_name()?.to_str()?.to_string();
                            if DateTime::parse_from_str(&backup_path, "%s.%f").is_err() {
                                tracing::warn!("Invalid backup directory name: {}", backup_path);

                                return None;
                            }

                            let created_at = entry
                                .metadata()
                                .ok()
                                .and_then(|m| m.created().ok())
                                .map(|t| t.into());

                            let backup_file_stats: Vec<FileStat> = WalkDir::new(&backup_dir)
                                .min_depth(1)
                                .into_iter()
                                .filter_map(|d| d.ok()?.into_path().try_into().ok())
                                .filter_map(|mut fs: FileStat| {
                                    let path = PathBuf::from(&fs.path)
                                        .strip_prefix(&backup_dir)
                                        .ok()?
                                        .to_str()?
                                        .to_string();

                                    fs.path = path;

                                    Some(fs)
                                })
                                .collect();

                            Some(BackupStats {
                                backup_file_stats,
                                created_at,
                                backup_path: backup_dir.to_str()?.to_string(),
                            })
                        })
                        .collect::<Vec<_>>(),
                );
            }

            let save_path = save_dir
                .to_str()
                .map(|s| s.to_string())
                .expect("Failed to convert save path to string, are there invalid characters?");

            let created_at = save_dir
                .metadata()
                .ok()
                .and_then(|m| m.created().ok())
                .map(|t| t.into());

            files.push(SaveFilesStat {
                file_stats,
                backups,
                emulator_id: Some(emulator_id),
                game_id: self.game.id,
                save_path,
                created_at,
            });
        }

        tracing::debug!(save_files.count = files.len(), "Resolved save files");

        Ok(files)
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn reindex_backups(&self, emulator_id: Option<i32>) -> Result<()> {
        let config = self.config.get_config().await;
        let max_backup_count = config.saves.map(|s| s.max_save_files_backups).unwrap_or(5) as usize;

        let mut current_save_files = self.resolve_save_files(true).await?;

        if let Some(emulator_id) = emulator_id {
            current_save_files.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        for save_files in current_save_files.iter_mut() {
            let backups = &mut save_files.backups;
            backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));

            if backups.len() > max_backup_count {
                for backup in &backups[max_backup_count..] {
                    tracing::info!(
                        "Evicting save file backup {} for game {}",
                        backup.backup_path,
                        self.game.id
                    );

                    tokio::fs::remove_dir_all(&backup.backup_path).await?;
                }
            }
        }

        Ok(())
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    fn get_saves_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf> {
        let saves_dir = RetromDirs::new().data_dir().join("saves");

        let emulator_id = match emulator_id {
            Some(id) => id,
            None => {
                return Err(SaveFileManagerError::InvalidArgument(
                    "Emulator ID is required".to_string(),
                ))
            }
        };

        Ok(saves_dir
            .join(emulator_id.to_string())
            .join(self.game.id.to_string()))
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    fn get_saves_backup_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf> {
        let backup_dir = RetromDirs::new().data_dir().join("saves_backups");

        let emulator_id = match emulator_id {
            Some(id) => id,
            None => {
                return Err(SaveFileManagerError::InvalidArgument(
                    "Emulator ID is required".to_string(),
                ))
            }
        };

        Ok(backup_dir
            .join(emulator_id.to_string())
            .join(self.game.id.to_string()))
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
            let backups_dir = self.get_saves_backup_dir(save_files.emulator_id)?;
            let backup_dir =
                backups_dir.join(chrono::Local::now().to_utc().format("%s.%f").to_string());

            if backup_dir.exists() {
                tracing::debug!(
                    "Backup staging directory {} already exists, removing",
                    backup_dir.display()
                );

                tokio::fs::remove_dir_all(&backup_dir).await?;
            }

            tokio::fs::create_dir_all(&backup_dir).await?;

            for file_stat in save_files.file_stats.iter_mut() {
                let relative_path = PathBuf::from(&file_stat.path);
                if relative_path.is_absolute() {
                    return Err(SaveFileManagerError::Internal(
                        "Source path must be relative to the save directory".to_string(),
                    ));
                }

                let src_path = save_path.join(&relative_path);
                let dest_path = backup_dir.join(relative_path);

                if !src_path.exists() {
                    tracing::warn!(
                        "Source file {} does not exist, skipping",
                        src_path.display()
                    );

                    continue;
                }

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

                if !dest_path
                    .parent()
                    .expect("No parent directory found")
                    .exists()
                {
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
    async fn update_save_files(&self, save_files: SaveFiles, dry_run: bool) -> Result<()> {
        let save_dir = self.get_saves_dir(save_files.emulator_id)?;
        self.backup_save_files(save_files.emulator_id, dry_run)
            .await?;

        if save_dir.exists() {
            if dry_run {
                tracing::debug!(
                    "Dry run: would remove existing save directory {}",
                    save_dir.display()
                );
            } else {
                tokio::fs::remove_dir_all(&save_dir).await?;
            }
        }

        tokio::fs::create_dir_all(&save_dir).await?;

        for file in save_files.files {
            let file_stat = match file.stat {
                Some(stat) => stat,
                None => {
                    return Err(SaveFileManagerError::InvalidArgument(
                        "FileStat is required".to_string(),
                    ));
                }
            };

            let relative_path = PathBuf::from(&file_stat.path);
            if relative_path.is_absolute() {
                return Err(SaveFileManagerError::InvalidArgument(
                    "Source path must be relative to the save directory".to_string(),
                ));
            }

            let dest_path = save_dir.join(&relative_path);

            if dry_run {
                tracing::info!(
                    "Dry run: would copy {} to {}",
                    relative_path.display(),
                    dest_path.display()
                );
            } else {
                tokio::fs::create_dir_all(dest_path.parent().unwrap()).await?;
                tokio::fs::write(&dest_path, file.content).await?;
            }
        }

        Ok(())
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn delete_save_files(&self, emulator_id: Option<i32>, dry_run: bool) -> Result<()> {
        let mut all_save_files = self.resolve_save_files(false).await?;

        if let Some(emulator_id) = emulator_id {
            all_save_files.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        for save_files in all_save_files.iter() {
            let save_path = PathBuf::from(&save_files.save_path);

            if !save_path.exists() {
                tracing::warn!(
                    "Save path {} does not exist, skipping deletion",
                    save_path.display()
                );

                continue;
            }

            if dry_run {
                tracing::info!(
                    "Dry run: would delete save files at {}",
                    save_path.display()
                );

                continue;
            }

            if let Err(e) = tokio::fs::remove_dir_all(&save_path).await {
                tracing::error!(
                    "Failed to delete save files at {}: {:#?}",
                    save_path.display(),
                    e
                );
            }
        }

        Ok(())
    }

    async fn restore_save_files_from_backup(
        &self,
        backup: BackupStats,
        reindex: bool,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<()> {
        let saves_dir = self.get_saves_dir(emulator_id)?;
        let backup_path = PathBuf::from(backup.backup_path);

        if !backup_path.exists() {
            return Err(SaveFileManagerError::InvalidArgument(
                "Backup path does not exist".to_string(),
            ));
        }

        if saves_dir.exists() {
            if dry_run {
                tracing::info!(
                    "Dry run: would remove existing save directory {}",
                    saves_dir.display()
                );
            } else {
                tokio::fs::remove_dir_all(&saves_dir).await?;
            }
        }

        if dry_run {
            tracing::info!(
                "Dry run: would restore save files from {} to {}",
                backup_path.display(),
                saves_dir.display()
            );
        } else if reindex {
            tokio::fs::rename(backup_path, &saves_dir).await?;
            self.reindex_backups(emulator_id).await?;
        } else {
            tokio::fs::create_dir_all(&saves_dir).await?;

            join_all(
                WalkDir::new(&backup_path)
                    .min_depth(1)
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .filter_map(|e| {
                        let path = e.path();
                        if path.is_file() {
                            Some(path.to_owned())
                        } else {
                            None
                        }
                    })
                    .filter_map(|file_path| {
                        let relative_path = file_path.strip_prefix(&backup_path).ok()?;
                        let dest_path = saves_dir.join(relative_path);

                        tracing::info!(
                            "Restoring save file from {} to {}",
                            file_path.display(),
                            dest_path.display()
                        );

                        Some(async {
                            tokio::fs::create_dir_all(
                                dest_path.parent().expect("Could not create parent dir"),
                            )
                            .await
                            .expect("Could not create parent dir");

                            if let Err(why) = tokio::fs::copy(file_path, dest_path).await {
                                tracing::error!("Failed to restore backup: {:#?}", why);
                            }
                        })
                    })
                    .collect::<Vec<_>>(),
            )
            .await;
        }

        Ok(())
    }
}
