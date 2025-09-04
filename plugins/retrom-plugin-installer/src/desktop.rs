use retrom_codegen::{
    retrom::{
        client::installation::{
            InstallationEvent, InstallationProgressUpdate, InstallationSpeed, InstallationStatus,
        },
        GetGamesRequest,
    },
    timestamp::Timestamp,
};
use retrom_plugin_config::ConfigExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use serde::de::DeserializeOwned;
use std::{
    collections::{HashMap, HashSet},
    fs::create_dir_all,
    path::PathBuf,
    time::SystemTime,
};
use tauri::{ipc::Channel, plugin::PluginApi, AppHandle, Emitter, Manager, Runtime};
use tokio::sync::RwLock;
use tracing::{debug, info, instrument, trace};

type GameId = i32;
type FileId = i32;

#[derive(Debug)]
pub struct FileInstallationProgress {
    pub file_id: FileId,
    pub bytes_read: usize,
    pub total_size: usize,
    pub last_updated: Timestamp,
    pub bytes_per_second: f64,
}

#[derive(Debug)]
pub struct GameInstallationProgress {
    pub game_id: GameId,
    pub files: Vec<FileInstallationProgress>,
    pub status: InstallationStatus,
}

pub struct Installer<R: Runtime> {
    app_handle: AppHandle<R>,
    pub(crate) installed_games: RwLock<HashSet<GameId>>,
    pub(crate) currently_installing: RwLock<HashMap<GameId, GameInstallationProgress>>,
    pub(crate) subscriptions: RwLock<Vec<Channel<InstallationProgressUpdate>>>,
}

#[instrument(skip(app, _api))]
pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Installer<R>> {
    let installer = Installer {
        app_handle: app.clone(),
        installed_games: RwLock::new(HashSet::new()),
        currently_installing: RwLock::new(HashMap::new()),
        subscriptions: RwLock::new(Vec::new()),
    };

    Ok(installer)
}

impl<R: Runtime> Installer<R> {
    pub async fn get_installation_dir(&self) -> crate::Result<PathBuf> {
        let app = self.app_handle.clone();
        let mut client_config = app.config_manager().get_config().await;

        let dir = match client_config
            .config
            .as_ref()
            .and_then(|config| config.installation_dir.clone())
        {
            Some(dir) => PathBuf::from(dir),
            None => {
                let dir = app.path().app_data_dir()?.join("installed");

                if !dir.try_exists().unwrap() {
                    tracing::info!("Creating install directory.");
                    create_dir_all(&dir)?;
                };

                let installation_dir = Some(dir.to_string_lossy().to_string());

                match client_config.config.as_mut() {
                    Some(config) => config.installation_dir = installation_dir,
                    None => {
                        client_config.config =
                            Some(retrom_codegen::retrom::retrom_client_config::Config {
                                installation_dir,
                                ..Default::default()
                            });
                    }
                };

                app.config_manager().update_config(client_config).await?;

                dir
            }
        };

        match dir.try_exists() {
            Ok(true) => Ok(dir),
            Ok(false) => {
                tracing::warn!(
                    "Cannot access installation directory, 
                    broken symlinks or permissions issues are likely"
                );
                create_dir_all(&dir)?;
                Ok(dir)
            }
            Err(e) => Err(e.into()),
        }
    }

    #[instrument(skip(self))]
    pub(crate) async fn init_installation_index(&self) -> crate::Result<()> {
        let install_dir = self.get_installation_dir().await?;

        let mut installed_games = HashSet::new();
        for dir in install_dir.read_dir()? {
            let dir = dir?;
            let game_id = match dir.file_name().to_string_lossy().parse::<i32>() {
                Ok(id) => id,
                _ => continue,
            };

            if dir.path().is_dir() {
                installed_games.insert(game_id);
            }
        }

        self.installed_games.write().await.extend(installed_games);
        self.update_steam_installations().await?;

        Ok(())
    }

    #[instrument(skip(self))]
    pub async fn update_steam_installations(&self) -> crate::Result<()> {
        let steam = match self.app_handle.steam() {
            Some(steam) => steam,
            None => {
                debug!("Steam plugin not initialized, skipping update.");
                return Ok(());
            }
        };

        let mut game_client = self.app_handle.get_game_client().await;
        let games = game_client
            .get_games(GetGamesRequest::default())
            .await
            .map_err(|e| crate::Error::Tonic(e.code()))?
            .into_inner()
            .games;

        let mut installed = Vec::new();
        for (app_id, game_id) in
            games.into_iter().filter(|g| g.third_party).filter_map(|g| {
                match g.steam_app_id.map(u32::try_from).and_then(Result::ok) {
                    Some(app_id) => Some((app_id, g.id)),
                    None => None,
                }
            })
        {
            if steam.get_installation_status(app_id).await? == InstallationStatus::Installed {
                installed.push(game_id);
            }
        }

        self.installed_games.write().await.extend(installed);

        Ok(())
    }

    #[instrument(skip(self), fields(installation_progress))]
    pub async fn mark_game_installing(&self, installation_progress: GameInstallationProgress) {
        info!("Installing game: {}", installation_progress.game_id);

        let game_id = installation_progress.game_id;
        self.currently_installing
            .write()
            .await
            .insert(game_id, installation_progress);

        debug!("Game installation started: {}", game_id);
    }

    #[instrument(skip(self), fields(game_id, field_id))]
    pub async fn mark_file_installed(&self, game_id: GameId, file_id: FileId) {
        debug!("Marking file as installed: {}", file_id);

        self.currently_installing
            .write()
            .await
            .get_mut(&game_id)
            .unwrap()
            .files
            .retain(|f| f.file_id != file_id);

        let files_remaining = self
            .currently_installing
            .read()
            .await
            .get(&game_id)
            .unwrap()
            .files
            .len();

        if files_remaining == 0 {
            self.mark_game_installed(game_id).await;
        }
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn mark_game_installed(&self, game_id: GameId) {
        info!("Marking game as installed: {}", game_id);

        self.currently_installing.write().await.remove(&game_id);
        self.installed_games.write().await.insert(game_id);

        self.app_handle
            .emit("game-installed", game_id)
            .expect("Error emitting event");
    }

    #[instrument(skip(self))]
    pub async fn mark_game_uninstalled(&self, game_id: GameId) {
        info!("Marking game as uninstalled: {}", game_id);

        self.installed_games.write().await.remove(&game_id);
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn get_game_installation_status(&self, game_id: GameId) -> InstallationStatus {
        trace!("Checking game installation status: {}", game_id);

        if let Some(progress) = self.currently_installing.read().await.get(&game_id) {
            progress.status
        } else if self.installed_games.read().await.contains(&game_id) {
            InstallationStatus::Installed
        } else {
            InstallationStatus::NotInstalled
        }
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn get_game_installation_percent(&self, game_id: GameId) -> Option<u32> {
        trace!("Checking game installation progress: {}", game_id);

        let installation = self.currently_installing.read().await;
        let installation = installation.get(&game_id)?;
        let total_size = installation
            .files
            .iter()
            .map(|f| f.total_size)
            .sum::<usize>() as f32;

        let bytes_read = installation
            .files
            .iter()
            .map(|f| f.bytes_read)
            .sum::<usize>() as f32;

        let percent = (bytes_read / total_size * 100.0) as u32;

        Some(percent)
    }

    pub async fn get_game_installation_speed(&self, game_id: GameId) -> Option<InstallationSpeed> {
        let installation = self.currently_installing.read().await;
        let installation = installation.get(&game_id)?;
        let num_files = installation.files.len() as u32;
        let total_bytes_per_second = installation
            .files
            .iter()
            .filter_map(|f| {
                if f.bytes_per_second > 0f64 {
                    Some(f.bytes_per_second)
                } else {
                    None
                }
            })
            .sum::<f64>();

        if num_files == 0 || total_bytes_per_second == 0f64 {
            None
        } else {
            Some(InstallationSpeed {
                bytes_per_second: total_bytes_per_second / num_files as f64,
            })
        }
    }

    #[instrument(skip(self), fields(game_id, file_id, bytes_read))]
    pub async fn update_installation_progress(
        &self,
        game_id: GameId,
        file_id: FileId,
        bytes_read: usize,
    ) {
        debug!(
            "Updating installation progress: game {game_id} file {file_id} - {bytes_read} bytes read"
        );

        let cur_progress = self.currently_installing.read().await;
        let cur_file = cur_progress
            .get(&game_id)
            .and_then(|g| g.files.iter().find(|f| f.file_id == file_id));

        let last_updated_at = cur_file
            .map(|f| f.last_updated.clone())
            .unwrap_or_else(|| SystemTime::now().into());

        let updated_at: Timestamp = SystemTime::now().into();

        let diff_seconds = (updated_at.seconds - last_updated_at.seconds) as f64;
        let diff_nanos = updated_at.nanos - last_updated_at.nanos;
        let seconds = diff_seconds + (diff_nanos as f64 / 1_000_000_000f64);

        let bytes_per_second = if seconds > 0.0 {
            bytes_read as f64 / seconds
        } else {
            bytes_read as f64
        };

        drop(cur_progress);

        {
            if let Some(file) = self
                .currently_installing
                .write()
                .await
                .get_mut(&game_id)
                .and_then(|g| g.files.iter_mut().find(|f| f.file_id == file_id))
            {
                file.bytes_read += bytes_read;
                file.last_updated = updated_at;
                file.bytes_per_second = bytes_per_second;
            }
        }

        self.emit_progress_update(game_id, InstallationEvent::Progress)
            .await;
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn mark_game_as_failed(&self, game_id: GameId) {
        info!("Marking installation of game {game_id} as failed");

        if let Some(entry) = self.currently_installing.write().await.get_mut(&game_id) {
            entry.status = InstallationStatus::Failed;
        };

        self.emit_progress_update(game_id, InstallationEvent::Failed)
            .await;
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn emit_progress_update(&self, game_id: GameId, event: InstallationEvent) {
        let percent = self.get_game_installation_percent(game_id).await.unwrap();
        let speed = self.get_game_installation_speed(game_id).await;

        let progress = InstallationProgressUpdate {
            game_id,
            event: event.into(),
            percent,
            speed,
            updated_at: Some(SystemTime::now().into()),
        };

        debug!("Emitting installation progress: {:?}", progress);
        let mut to_remove = Vec::new();
        let subs = self.subscriptions.read().await;
        for channel in subs.iter() {
            if let Err(e) = channel.send(progress.clone()) {
                tracing::error!("Error sending installation progress update: {}", e);
                to_remove.push(channel.id());
            }
        }

        if !to_remove.is_empty() {
            self.subscriptions
                .write()
                .await
                .retain(|c| !to_remove.contains(&c.id()));
        }
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn get_game_installation_path(&self, game_id: GameId) -> Option<PathBuf> {
        trace!("Getting game installation path: {}", game_id);

        let install_dir = self.get_installation_dir().await.ok()?;
        let game_dir = install_dir.join(game_id.to_string());

        if game_dir.try_exists().unwrap() {
            Some(game_dir)
        } else {
            None
        }
    }
}
