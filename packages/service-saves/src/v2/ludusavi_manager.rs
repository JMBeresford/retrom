use super::error::Result;
use ludusavi::{
    api::{
        parameters::{BackUp, ListBackups, Restore},
        ApiOutput, Config, Finality, Ludusavi, Manifest,
    },
    report::{ApiFile, ApiGame},
    resource::config::{
        BackupConfig, BackupFormat, BackupFormats, CustomGame, RestoreConfig, Retention, Root,
        ZipCompression, ZipConfig,
    },
};
use retrom_service_common::retrom_dirs::RetromDirs;
use std::{collections::BTreeMap, path::PathBuf};
use tracing::instrument;

pub struct LudusaviManager {
    emulator_ids: Vec<String>,
    ludusavi: Ludusavi,
}

pub enum SaveKind {
    /// SRAM saves
    Saves,
    /// Emulator save states
    SaveStates,
}

impl LudusaviManager {
    pub fn new(emulator_ids: &[&str], save_kind: SaveKind) -> Self {
        let custom_games: Vec<CustomGame> = emulator_ids
            .iter()
            .filter_map(|emulator_id| {
                let files_directory = match save_kind {
                    SaveKind::Saves => Self::get_emulator_save_dir(emulator_id)
                        .to_str()?
                        .to_string(),
                    SaveKind::SaveStates => Self::get_emulator_save_states_dir(emulator_id)
                        .to_str()?
                        .to_string(),
                };

                Some(CustomGame {
                    name: emulator_id.to_string(),
                    files: vec![files_directory],
                    ..Default::default()
                })
            })
            .collect();

        let backup_path = match save_kind {
            SaveKind::Saves => RetromDirs::new().saves_backups_dir(),
            SaveKind::SaveStates => RetromDirs::new().save_states_backups_dir(),
        };

        let restore_path = match save_kind {
            SaveKind::Saves => RetromDirs::new().saves_dir(),
            SaveKind::SaveStates => RetromDirs::new().save_states_dir(),
        };

        let root = match save_kind {
            SaveKind::Saves => RetromDirs::new().saves_dir(),
            SaveKind::SaveStates => RetromDirs::new().save_states_dir(),
        };

        let config = Config {
            roots: vec![Root::default().with_path(root.into())],
            backup: BackupConfig {
                path: backup_path.into(),
                format: BackupFormats {
                    chosen: BackupFormat::Zip,
                    zip: ZipConfig {
                        compression: ZipCompression::Zstd,
                    },
                    ..Default::default()
                },
                retention: Retention {
                    full: 5,
                    differential: 0,
                    force_new_full: false,
                },
                only_constructive: false,
                ..Default::default()
            },
            restore: RestoreConfig {
                path: restore_path.into(),
                ..Default::default()
            },
            custom_games,
            ..Default::default()
        };

        let mut manifest = Manifest::default();
        manifest.add_custom_games(&config);

        Self {
            emulator_ids: emulator_ids.into_iter().map(|s| s.to_string()).collect(),
            ludusavi: Ludusavi::new(config, manifest),
        }
    }

    pub fn get_emulator_save_dir(emulator_id: &str) -> PathBuf {
        RetromDirs::new().saves_dir().join(emulator_id)
    }

    pub fn get_emulator_save_states_dir(emulator_id: &str) -> PathBuf {
        RetromDirs::new().save_states_dir().join(emulator_id)
    }

    #[instrument(skip(self))]
    pub fn back_up(&mut self, dry_run: Option<bool>) -> Result<ApiOutput> {
        let finality = match dry_run {
            Some(true) => Finality::Preview,
            _ => Finality::Final,
        };

        let output = self.ludusavi.back_up(BackUp {
            finality,
            games: self.emulator_ids.clone(),
            resolve_cloud_conflict: None,
            wine_prefix: None,
            include_disabled: false,
            skip_downgrade: false,
        })?;

        Ok(output)
    }

    #[instrument(skip(self))]
    pub fn restore(&mut self, backup: Option<String>, dry_run: Option<bool>) -> Result<ApiOutput> {
        let finality = match dry_run {
            Some(true) => Finality::Preview,
            _ => Finality::Final,
        };

        let output = self.ludusavi.restore(Restore {
            finality,
            games: self.emulator_ids.clone(),
            resolve_cloud_conflict: None,
            include_disabled: false,
            skip_downgrade: false,
            backup,
        })?;

        Ok(output)
    }

    #[instrument(skip_all)]
    pub fn list_backups(&self, params: Option<ListBackups>) -> Result<ApiOutput> {
        let params = params.unwrap_or(ListBackups {
            games: self.emulator_ids.clone(),
        });

        let output = self.ludusavi.list_backups(params)?;

        Ok(output)
    }

    #[instrument(skip(self))]
    pub fn list_files(&mut self) -> Result<Vec<(String, BTreeMap<String, ApiFile>)>> {
        let output = self.back_up(Some(true))?;

        let files = output
            .games
            .into_iter()
            .filter_map(|(id, game)| match game {
                ApiGame::Operative { files, .. } => Some((id, files)),
                _ => None,
            })
            .collect::<Vec<_>>();

        Ok(files)
    }

    #[instrument(skip(self))]
    pub fn _list_backup_files(&mut self) -> Result<Vec<(i32, BTreeMap<String, ApiFile>)>> {
        let with_parsed_id = self
            .restore(None, Some(true))?
            .games
            .into_iter()
            .filter_map(|(name, game)| match name.parse::<i32>() {
                Ok(id) => Some((id, game)),
                Err(_) => None,
            });

        let files = with_parsed_id
            .filter_map(|(id, game)| match game {
                ApiGame::Operative { files, .. } => Some((id, files)),
                _ => None,
            })
            .collect::<Vec<_>>();

        Ok(files)
    }
}
