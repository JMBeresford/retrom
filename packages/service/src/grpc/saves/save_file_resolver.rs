use std::path::PathBuf;

use diesel::{ExpressionMethods, PgArrayExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    files::FileStat, get_save_files_response::SaveFiles, stat_save_files_response::SaveFilesStat,
    update_save_files_response::UpdatedSaveFiles, BackupStats, Emulator, FilesystemNodeType, Game,
};
use retrom_db::Pool;
use walkdir::WalkDir;

use crate::meta::RetromDirs;

#[derive(thiserror::Error, Debug)]
pub enum SaveFileResolverError {
    #[error("Not Found: {0}")]
    NotFound(String),
    #[error("Failed to resolve save files: {0}")]
    PermissionDenied(String),
    #[error("Failed to resolve save files: {0}")]
    InvalidArgument(String),
    #[error("Failed to resolve save files: {0}")]
    Internal(String),

    #[error("Failed to resolve save files: {0}")]
    Diesel(#[from] diesel::result::Error),

    #[error("Failed to resolve save files: {0}")]
    Io(#[from] std::io::Error),
}

type Result<T> = std::result::Result<T, SaveFileResolverError>;

pub struct GameSaveFileResolver {
    game: Game,
    db_pool: Pool,
}

impl GameSaveFileResolver {
    pub fn new(game: Game, db_pool: Pool) -> Self {
        Self { game, db_pool }
    }
}

pub trait SaveFileResolver {
    async fn resolve_save_files(&self, include_backups: bool) -> Result<Vec<SaveFilesStat>>;

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

impl SaveFileResolver for GameSaveFileResolver {
    async fn resolve_save_files(&self, include_backups: bool) -> Result<Vec<SaveFilesStat>> {
        let mut conn = self.db_pool.get().await.map_err(|e| {
            SaveFileResolverError::Internal(format!("Failed to get DB connection: {}", e))
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

        let emulator_dirs: Vec<PathBuf> = saves_dir
            .read_dir()?
            .filter_map(|d| Some(d.ok()?.path()))
            .filter(|d| {
                emulators
                    .iter()
                    .any(|emu| d.file_name().and_then(|s| s.to_str()) == Some(&emu.name))
                    && d.is_dir()
            })
            .collect();

        let mut files = vec![];
        for emulator_dir in &emulator_dirs {
            let save_dir = emulator_dir.join(self.game.id.to_string());
            let backup_prefix = format!("._{}", self.game.id);
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
                let file_stats: Vec<FileStat> = WalkDir::new(save_dir)
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
                        });
                    }
                }

                files.push(SaveFilesStat {
                    file_stats,
                    backups,
                    emulator_id: None,
                    game_id: self.game.id,
                });
            }
        }

        tracing::debug!(save_files.count = files.len(), "Resolved save files");

        Ok(files)
    }

    async fn update_save_files(
        &self,
        save_files: SaveFiles,
        dry_run: bool,
    ) -> Result<UpdatedSaveFiles> {
        // Implement the logic to update save files
        unimplemented!()
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
