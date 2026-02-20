use chrono::DateTime;
use diesel::{ExpressionMethods, PgArrayExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use futures::future::join_all;
use retrom_codegen::retrom::{
    files::FileStat, BackupStats, Emulator, Game, SaveStates, SaveStatesStat,
};
use retrom_db::Pool;
use retrom_service_common::{config::ServerConfigManager, retrom_dirs::RetromDirs};
use std::{path::PathBuf, sync::Arc};
use tracing::instrument;
use walkdir::WalkDir;

#[derive(thiserror::Error, Debug)]
pub enum SaveStateManagerError {
    #[error("SaveStateManagerError: {0}")]
    InvalidArgument(String),
    #[error("SaveStateManagerError: {0}")]
    Internal(String),

    #[error("DB Error: {0}")]
    Diesel(#[from] diesel::result::Error),

    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),
}

type Result<T> = std::result::Result<T, SaveStateManagerError>;

pub struct GameSaveStateManager {
    game: Game,
    db_pool: Arc<Pool>,
    config: Arc<ServerConfigManager>,
}

impl GameSaveStateManager {
    pub fn new(game: Game, db_pool: Arc<Pool>, config: Arc<ServerConfigManager>) -> Self {
        Self {
            game,
            db_pool,
            config,
        }
    }
}

pub trait SaveStateManager {
    async fn resolve_save_states(&self, include_backups: bool) -> Result<Vec<SaveStatesStat>>;
    async fn reindex_backups(&self, emulator_id: Option<i32>) -> Result<()>;
    async fn get_states_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf>;
    async fn get_states_backup_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf>;

    async fn backup_save_states(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveStatesStat>>;

    async fn update_save_states(&self, save_states: SaveStates, dry_run: bool) -> Result<()>;

    async fn delete_save_states(
        &self,
        emulator_id: Option<i32>,
        files: Vec<FileStat>,
        dry_run: bool,
    ) -> Result<()>;

    async fn restore_save_states_from_backup(
        &self,
        backup: BackupStats,
        reindex: bool,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<()>;
}

impl SaveStateManager for GameSaveStateManager {
    #[instrument(skip(self))]
    async fn resolve_save_states(&self, include_backups: bool) -> Result<Vec<SaveStatesStat>> {
        let mut conn = self.db_pool.get().await.map_err(|e| {
            SaveStateManagerError::Internal(format!("Failed to get DB connection: {e:#?}"))
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

        let all_states_dir = RetromDirs::new().data_dir().join("states");

        tokio::fs::create_dir_all(&all_states_dir).await?;

        let mut files = vec![];

        for emulator_id in emulators.iter().map(|e| e.id) {
            let states_dir = self.get_states_dir(Some(emulator_id)).await?;
            let backups_dir = self.get_states_backup_dir(Some(emulator_id)).await?;

            let file_stats: Vec<FileStat> = if states_dir.exists() {
                states_dir
                    .read_dir()?
                    .filter_map(|d| d.ok()?.path().try_into().ok())
                    .filter_map(|mut fs: FileStat| {
                        let path = PathBuf::from(&fs.path)
                            .strip_prefix(&states_dir)
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
                tokio::fs::create_dir_all(&backups_dir).await?;

                backups.extend(
                    backups_dir
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
                                .max_depth(1)
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

            let states_path = states_dir
                .to_str()
                .map(|s| s.to_string())
                .expect("Failed to convert save path to string, are there invalid characters?");

            let created_at = states_dir
                .metadata()
                .ok()
                .and_then(|m| m.created().ok())
                .map(|t| t.into());

            files.push(SaveStatesStat {
                file_stats,
                backups,
                emulator_id: Some(emulator_id),
                game_id: self.game.id,
                states_path,
                created_at,
            });
        }

        tracing::debug!(save_states.count = files.len(), "Resolved save files");

        Ok(files)
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn reindex_backups(&self, emulator_id: Option<i32>) -> Result<()> {
        let config = self.config.get_config().await;
        let max_backup_count =
            config.saves.map(|s| s.max_save_states_backups).unwrap_or(5) as usize;

        let mut current_save_states = self.resolve_save_states(true).await?;

        if let Some(emulator_id) = emulator_id {
            current_save_states.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        for save_states in current_save_states.iter_mut() {
            let backups = &mut save_states.backups;
            backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));

            if backups.len() > max_backup_count {
                for backup in &backups[max_backup_count..] {
                    tracing::info!(
                        "Evicting save state backup {} for game {}",
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
    async fn get_states_backup_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf> {
        let config = self.config.get_config().await;
        let backup_dir = RetromDirs::new().data_dir().join("states_backups");

        let emulator_id = match emulator_id {
            Some(id) => id,
            None => {
                return Err(SaveStateManagerError::InvalidArgument(
                    "Emulator ID is required".to_string(),
                ))
            }
        };

        // Check if we should use the game library path structure
        if config.saves.as_ref().and_then(|s| s.save_dir_structure).map(|s| s == retrom_codegen::retrom::SaveDirStructure::MirrorLibrary as i32).unwrap_or(false) {
            let game_path = PathBuf::from(&self.game.path);
            
            // Find the content directory that contains this game
            let content_dirs = &config.content_directories;
            for content_dir in content_dirs {
                let content_path = PathBuf::from(&content_dir.path);
                
                // Try to get the relative path from the content directory to the game
                if let Ok(relative_game_path) = game_path.strip_prefix(&content_path) {
                    // Get the parent directory of the ROM file (game directory)
                    if let Some(game_dir) = relative_game_path.parent() {
                        let path_components: Vec<&str> = game_dir.components()
                            .filter_map(|comp| {
                                if let std::path::Component::Normal(os_str) = comp {
                                    os_str.to_str()
                                } else {
                                    None
                                }
                            })
                            .collect();
                        
                        // We want platform/game_name structure (first two components)
                        if path_components.len() >= 2 {
                            let platform = path_components[0];
                            let game_name = path_components[1];
                            
                            // Sanitize each component
                            if !platform.contains("..") && !game_name.contains("..") 
                                && !platform.is_empty() && !game_name.is_empty() {
                                let save_path = format!("{}/{}", platform, game_name);
                                return Ok(backup_dir.join(save_path));
                            }
                        }
                    }
                    break; // Found the matching content directory, no need to continue
                }
            }
            
            // Fallback to default structure if no content directory matched or path is invalid
            Ok(backup_dir
                .join(emulator_id.to_string())
                .join(self.game.id.to_string()))
        } else {
            // Default directory structure
            Ok(backup_dir
                .join(emulator_id.to_string())
                .join(self.game.id.to_string()))
        }
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn get_states_dir(&self, emulator_id: Option<i32>) -> Result<PathBuf> {
        let config = self.config.get_config().await;
        let states_dir = RetromDirs::new().data_dir().join("states");

        let emulator_id = match emulator_id {
            Some(id) => id,
            None => {
                return Err(SaveStateManagerError::InvalidArgument(
                    "Emulator ID is required".to_string(),
                ))
            }
        };

        // Check if we should use the game library path structure
        if config.saves.as_ref().and_then(|s| s.save_dir_structure).map(|s| s == retrom_codegen::retrom::SaveDirStructure::MirrorLibrary as i32).unwrap_or(false) {
            let game_path = PathBuf::from(&self.game.path);
            
            // Find the content directory that contains this game
            let content_dirs = &config.content_directories;
            for content_dir in content_dirs {
                let content_path = PathBuf::from(&content_dir.path);
                
                // Try to get the relative path from the content directory to the game
                if let Ok(relative_game_path) = game_path.strip_prefix(&content_path) {
                    // Get the parent directory of the ROM file (game directory)
                    if let Some(game_dir) = relative_game_path.parent() {
                        let path_components: Vec<&str> = game_dir.components()
                            .filter_map(|comp| {
                                if let std::path::Component::Normal(os_str) = comp {
                                    os_str.to_str()
                                } else {
                                    None
                                }
                            })
                            .collect();
                        
                        // We want platform/game_name structure (first two components)
                        if path_components.len() >= 2 {
                            let platform = path_components[0];
                            let game_name = path_components[1];
                            
                            // Sanitize each component
                            if !platform.contains("..") && !game_name.contains("..") 
                                && !platform.is_empty() && !game_name.is_empty() {
                                let save_path = format!("{}/{}", platform, game_name);
                                return Ok(states_dir.join(save_path));
                            }
                        }
                    }
                    break; // Found the matching content directory, no need to continue
                }
            }
            
            // Fallback to default structure if no content directory matched or path is invalid
            Ok(states_dir
                .join(emulator_id.to_string())
                .join(self.game.id.to_string()))
        } else {
            // Default directory structure
            Ok(states_dir
                .join(emulator_id.to_string())
                .join(self.game.id.to_string()))
        }
    }

    #[instrument(skip(self), fields(game_id = self.game.id))]
    async fn backup_save_states(
        &self,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<Vec<SaveStatesStat>> {
        let mut all_save_states = self.resolve_save_states(false).await?;

        if let Some(emulator_id) = emulator_id {
            all_save_states.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        for save_states in all_save_states.iter_mut() {
            let states_path = PathBuf::from(&save_states.states_path);
            let backups_dir = self.get_states_backup_dir(save_states.emulator_id).await?;
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

            for file_stat in save_states.file_stats.iter_mut() {
                let relative_path = PathBuf::from(&file_stat.path);
                if relative_path.is_absolute() {
                    return Err(SaveStateManagerError::Internal(
                        "Source path must be relative to the save directory".to_string(),
                    ));
                }

                let src_path = states_path.join(&relative_path);
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

        Ok(all_save_states)
    }

    #[instrument(skip_all, fields(game_id = self.game.id))]
    async fn update_save_states(&self, save_states: SaveStates, dry_run: bool) -> Result<()> {
        let states_dir = self.get_states_dir(save_states.emulator_id).await?;
        self.backup_save_states(save_states.emulator_id, dry_run)
            .await?;

        tokio::fs::create_dir_all(&states_dir).await?;

        for file in save_states.files {
            let file_stat = match file.stat {
                Some(stat) => stat,
                None => {
                    return Err(SaveStateManagerError::InvalidArgument(
                        "FileStat is required".to_string(),
                    ));
                }
            };

            let relative_path = PathBuf::from(&file_stat.path);
            if relative_path.is_absolute() {
                return Err(SaveStateManagerError::InvalidArgument(
                    "Source path must be relative to the save directory".to_string(),
                ));
            }

            let dest_path = states_dir.join(&relative_path);

            if dest_path.exists() {
                if dry_run {
                    tracing::info!(
                        "Dry run: would overwrite existing file {}",
                        dest_path.display()
                    );
                    continue;
                } else {
                    tokio::fs::remove_file(&dest_path).await?;
                }
            }

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
    async fn delete_save_states(
        &self,
        emulator_id: Option<i32>,
        files: Vec<FileStat>,
        dry_run: bool,
    ) -> Result<()> {
        let mut all_save_states = self.resolve_save_states(false).await?;

        if let Some(emulator_id) = emulator_id {
            all_save_states.retain(|sf| sf.emulator_id == Some(emulator_id));
        }

        let files_specified = !files.is_empty();

        for save_states in all_save_states.iter() {
            let states_path = PathBuf::from(&save_states.states_path);

            if !states_path.exists() {
                tracing::warn!(
                    "Save states path {} does not exist, skipping deletion",
                    states_path.display()
                );

                continue;
            }

            if dry_run {
                tracing::info!(
                    "Dry run: would delete save states at {}",
                    states_path.display()
                );

                continue;
            }

            if !files_specified {
                if let Err(e) = tokio::fs::remove_dir_all(&states_path).await {
                    tracing::error!(
                        "Failed to delete save states at {}: {:#?}",
                        states_path.display(),
                        e
                    );
                }
            } else {
                for file_stat in files.iter() {
                    let relative_path = PathBuf::from(&file_stat.path);
                    if relative_path.is_absolute() {
                        return Err(SaveStateManagerError::InvalidArgument(
                            "Source path must be relative to the save states directory".to_string(),
                        ));
                    }

                    let file_path = states_path.join(&relative_path);

                    if !file_path.exists() {
                        tracing::warn!(
                            "File {} does not exist, skipping deletion",
                            file_path.display()
                        );
                        continue;
                    }

                    if file_path.is_file() {
                        if dry_run {
                            tracing::info!("Dry run: would delete file {}", file_path.display());
                        } else if let Err(e) = tokio::fs::remove_file(&file_path).await {
                            tracing::error!(
                                "Failed to delete file {}: {:#?}",
                                file_path.display(),
                                e
                            );
                        }
                    }
                }
            }
        }

        Ok(())
    }

    async fn restore_save_states_from_backup(
        &self,
        backup: BackupStats,
        reindex: bool,
        emulator_id: Option<i32>,
        dry_run: bool,
    ) -> Result<()> {
        let states_dir = self.get_states_dir(emulator_id).await?;
        let backup_path = PathBuf::from(backup.backup_path);

        if !backup_path.exists() {
            return Err(SaveStateManagerError::InvalidArgument(
                "Backups path does not exist".to_string(),
            ));
        }

        if states_dir.exists() {
            if dry_run {
                tracing::info!(
                    "Dry run: would remove existing save states directory {}",
                    states_dir.display()
                );
            } else {
                tokio::fs::remove_dir_all(&states_dir).await?;
            }
        }

        if dry_run {
            tracing::info!(
                "Dry run: would restore save states from {} to {}",
                backup_path.display(),
                states_dir.display()
            );
        } else if reindex {
            tokio::fs::rename(backup_path, &states_dir).await?;
            self.reindex_backups(emulator_id).await?;
        } else {
            tokio::fs::create_dir_all(&states_dir).await?;

            join_all(
                WalkDir::new(&backup_path)
                    .min_depth(1)
                    .max_depth(1)
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
                        let dest_path = states_dir.join(relative_path);

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
