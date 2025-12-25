use super::error::Result;
use ludusavi::{
    api::{
        parameters::{BackUp, ListBackups, Restore},
        ApiOutput, Config, Finality, Ludusavi, Manifest, StrictPath,
    },
    report::{ApiFile, ApiGame},
    resource::config::{
        BackupConfig, BackupFormat, BackupFormats, CustomGame, RestoreConfig, Retention, Root,
        ZipCompression, ZipConfig,
    },
};
use retrom_codegen::retrom::Emulator;
use retrom_service_common::retrom_dirs::RetromDirs;
use std::{collections::BTreeMap, path::PathBuf};
use tracing::instrument;

pub struct LudusaviManager {
    emulators: Vec<Emulator>,
    ludusavi: Ludusavi,
}

impl LudusaviManager {
    pub fn new(emulators: &[Emulator]) -> Self {
        let custom_games: Vec<CustomGame> = emulators
            .iter()
            .filter_map(|emulator| {
                let save_directory = Self::get_emulator_save_dir(emulator).to_str()?.to_string();

                Some(CustomGame {
                    name: emulator.id.to_string(),
                    alias: emulator.name.clone().into(),
                    files: vec![save_directory],
                    ..Default::default()
                })
            })
            .collect();

        let config = Config {
            roots: vec![Root::default().with_path(RetromDirs::new().saves_dir().into())],
            backup: BackupConfig {
                path: RetromDirs::new().saves_backups_dir().into(),
                format: BackupFormats {
                    chosen: BackupFormat::Zip,
                    zip: ZipConfig {
                        compression: ZipCompression::Zstd,
                    },
                    ..Default::default()
                },
                retention: Retention {
                    full: 3,
                    differential: 5,
                    force_new_full: false,
                },
                only_constructive: false,
                ..Default::default()
            },
            restore: RestoreConfig {
                path: StrictPath::from(RetromDirs::new().saves_dir()),
                ..Default::default()
            },
            custom_games,
            ..Default::default()
        };

        let mut manifest = Manifest::default();
        manifest.add_custom_games(&config);

        Self {
            emulators: emulators.to_vec(),
            ludusavi: Ludusavi::new(config, manifest),
        }
    }

    pub fn get_emulator_save_dir(emulator: &Emulator) -> PathBuf {
        RetromDirs::new().saves_dir().join(emulator.id.to_string())
    }

    #[instrument(skip(self))]
    pub fn back_up(&mut self, dry_run: Option<bool>) -> Result<ApiOutput> {
        let finality = match dry_run {
            Some(true) => Finality::Preview,
            _ => Finality::Final,
        };

        let output = self.ludusavi.back_up(BackUp {
            finality,
            games: self.emulators.iter().map(|e| e.id.to_string()).collect(),
            resolve_cloud_conflict: None,
            wine_prefix: None,
            include_disabled: false,
            skip_downgrade: true,
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
            games: self.emulators.iter().map(|e| e.id.to_string()).collect(),
            resolve_cloud_conflict: None,
            include_disabled: false,
            skip_downgrade: true,
            backup,
        })?;

        Ok(output)
    }

    #[instrument(skip_all)]
    pub fn list_backups(&self, params: Option<ListBackups>) -> Result<ApiOutput> {
        let params = params.unwrap_or(ListBackups {
            games: self.emulators.iter().map(|e| e.id.to_string()).collect(),
        });

        let output = self.ludusavi.list_backups(params)?;

        Ok(output)
    }

    #[instrument(skip(self))]
    pub fn list_files(&mut self) -> Result<Vec<(i32, BTreeMap<String, ApiFile>)>> {
        let output = self.back_up(Some(true))?;

        let with_parsed_id =
            output
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

    #[instrument(skip(self))]
    pub fn list_backup_files(&mut self) -> Result<Vec<(i32, BTreeMap<String, ApiFile>)>> {
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
