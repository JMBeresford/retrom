use futures::TryStreamExt;
use prost::Message;
use reqwest::header::ACCESS_CONTROL_ALLOW_ORIGIN;
use retrom_codegen::{
    retrom::{
        client::installation::{
            InstallGamePayload, InstallationEvent, InstallationIndex, InstallationMetrics,
            InstallationProgressUpdate, InstallationStatus,
        },
        Game, GetGamesRequest, GetPlatformsRequest, StorageType,
    },
    timestamp::Timestamp,
};
use retrom_plugin_config::ConfigExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use serde::de::DeserializeOwned;
use std::{collections::HashMap, fs::create_dir_all, path::PathBuf, time::SystemTime};
use tauri::{ipc::Channel, plugin::PluginApi, AppHandle, Manager, Runtime};
use tokio::{
    io::AsyncWriteExt,
    sync::{Mutex, RwLock},
    task::JoinSet,
};
use tracing::{debug, info, instrument, trace, warn, Instrument};

use crate::InstallerExt;

type GameId = i32;
type FileId = i32;

#[derive(Debug)]
pub struct FileInstallationProgress {
    pub file_id: FileId,
    pub bytes_read: usize,
    pub total_size: usize,
}

#[derive(Debug, Default)]
pub struct GameInstallationProgress {
    pub game_id: GameId,
    pub total_size: usize,
    pub files: Vec<FileInstallationProgress>,
    pub status: InstallationStatus,
    pub updates: Vec<InstallationProgressUpdate>,
}

pub struct Installer<R: Runtime> {
    app_handle: AppHandle<R>,
    client: reqwest::Client,
    installation_threads: Mutex<JoinSet<crate::Result<()>>>,
    pub(crate) installation_index: RwLock<HashMap<GameId, GameInstallationProgress>>,
    pub(crate) progress_subscriptions: RwLock<Vec<Channel<&'static [u8]>>>,
    pub(crate) index_subscriptions: RwLock<Vec<Channel<&'static [u8]>>>,
}

#[instrument(skip(app, _api))]
pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Installer<R>> {
    let installer = Installer {
        app_handle: app.clone(),
        client: reqwest::Client::new(),
        installation_threads: Mutex::new(JoinSet::new()),
        installation_index: RwLock::new(HashMap::new()),
        progress_subscriptions: RwLock::new(Vec::new()),
        index_subscriptions: RwLock::new(Vec::new()),
    };

    Ok(installer)
}

impl<R: Runtime> Installer<R> {
    #[instrument(skip(self, payload))]
    pub(crate) async fn begin_installation(
        &self,
        payload: InstallGamePayload,
    ) -> crate::Result<()> {
        let app_handle = self.app_handle.clone();
        let game_id = payload.game_id;
        let mut game_client = app_handle.get_game_client().await;

        let res = game_client
            .get_games(GetGamesRequest {
                ids: vec![game_id],
                with_files: Some(true),
                ..Default::default()
            })
            .await?
            .into_inner();

        let game = res.games.into_iter().next().ok_or_else(|| {
            crate::error::Error::InternalError(format!("Game with id {game_id} not found"))
        })?;

        if game.third_party {
            return self.install_third_party_game(game).await;
        }

        let install_dir = self.get_installation_dir().await?;
        let output_directory = install_dir.join(game.id.to_string());

        if !(output_directory.try_exists()?) {
            std::fs::create_dir_all(&output_directory)?;
        }

        let files = res
            .game_files
            .into_iter()
            .filter(|f| f.game_id == game.id)
            .collect::<Vec<_>>();

        let installation = GameInstallationProgress {
            game_id: game.id,
            status: InstallationStatus::Installing,
            total_size: files.iter().map(|f| f.byte_size as usize).sum(),
            updates: Vec::new(),
            files: files
                .iter()
                .map(|f| FileInstallationProgress {
                    file_id: f.id,
                    bytes_read: 0,
                    total_size: f.byte_size as usize,
                })
                .collect(),
        };

        self.mark_game_installing(installation).await?;

        let client = self.client.clone();
        self.installation_threads.lock().await.spawn(async move {
            let futures = files.into_iter().map(|file| {
                {
                    let game = game.clone();
                    let client = client.clone();
                    let app_handle = app_handle.clone();
                    let output_directory = output_directory.clone();
                    let game_id = game.id;
                    let file_id = file.id;

                    async move {
                        let app_handle = app_handle.clone();
                        let installer = app_handle.installer();
                        let client_config = app_handle.config_manager().get_config().await;

                        let host: String = match client_config.server.map(|server| {
                            let mut host = server.hostname.to_string();

                            if let Some(port) = server.port {
                                host.push_str(&format!(":{port}"));
                            }

                            host
                        }) {
                            Some(host) => host,
                            None => {
                                tracing::warn!("No server configuration found");
                                "http://localhost:5101".to_string()
                            }
                        };

                        let download_uri = format!("{host}/rest/file/{}", file.id);

                        let res = client
                            .get(download_uri)
                            .header(ACCESS_CONTROL_ALLOW_ORIGIN, host)
                            .send()
                            .await?;

                        debug!("Downloading file: {:?}", res);

                        let game_path = PathBuf::from(&game.path);
                        let prefix = match game.storage_type() {
                            StorageType::MultiFileGame => game_path.clone(),
                            StorageType::SingleFileGame => {
                                game_path.clone().parent().unwrap().to_path_buf()
                            }
                            _ => {
                                return Err(crate::error::Error::InternalError(
                                    "Invalid storage type".into(),
                                ))
                            }
                        };

                        let file_path = PathBuf::from(file.path);
                        let relative_file = file_path
                            .strip_prefix(&prefix)
                            .expect("could not strip file prefix");

                        let absolute_file = output_directory.join(relative_file);
                        std::fs::create_dir_all(absolute_file.parent().unwrap())?;

                        let mut outfile = tokio::fs::File::create(absolute_file).await?;
                        let mut stream = res.bytes_stream();

                        loop {
                            match installer
                                .installation_index
                                .read()
                                .await
                                .get(&game.id)
                                .map(|p| p.status)
                                .unwrap_or_default()
                            {
                                InstallationStatus::Installing => {}
                                InstallationStatus::Paused => {
                                    continue;
                                }
                                InstallationStatus::Installed => {
                                    break;
                                }
                                InstallationStatus::Failed => {
                                    return Err(crate::error::Error::InstallationAborted);
                                }
                                _ => {
                                    return Err(crate::error::Error::InstallationAborted);
                                }
                            }

                            let chunk = stream.try_next().await;
                            let bytes = match chunk {
                                Ok(Some(bytes)) => bytes,
                                Ok(None) => break,
                                Err(e) => {
                                    installer.mark_game_as_failed(game.id).await?;
                                    return Err(crate::error::Error::from(e));
                                }
                            };

                            if bytes.is_empty() {
                                break;
                            }

                            outfile.write_all(&bytes).await?;
                            if let Err(why) = installer
                                .update_installation_progress(game.id, file.id, bytes.len())
                                .await
                            {
                                warn!("Failed to update installation progress: {}", why);
                            }
                        }

                        Ok(())
                    }
                    .instrument(tracing::info_span!(
                        "file_installation",
                        game_id,
                        file_id
                    ))
                }
                .instrument(tracing::info_span!("game_installation", game_id))
            });

            futures::future::try_join_all(futures).await?;
            app_handle.installer().mark_game_installed(game_id).await?;

            Ok(())
        });

        Ok(())
    }

    #[instrument(skip(self, game))]
    async fn install_third_party_game(&self, game: Game) -> crate::Result<()> {
        let app_handle = self.app_handle.clone();
        let mut platform_svc_client = app_handle.get_platform_client().await;

        let steam_id = u32::try_from(game.steam_app_id()).expect("Could not convert steam id");

        let platform_res = platform_svc_client
            .get_platforms(GetPlatformsRequest {
                ids: vec![game.platform_id()],
                ..Default::default()
            })
            .await
            .map_err(|e| crate::Error::Tonic(e.code()))?
            .into_inner();

        let platform = platform_res.platforms.into_iter().next();

        let platform_path = match platform {
            Some(platform) => platform.path.clone(),
            None => {
                tracing::error!("No third party platform found for game: {:?}", game);
                return Err(crate::error::Error::ThirdPartyNotFound);
            }
        };

        match platform_path.as_str() {
            "__RETROM_RESERVED__/Steam" => {
                let steam_client = match app_handle.steam() {
                    Some(client) => client,
                    None => {
                        tracing::error!("Steam client not initialized");
                        return Err(crate::error::Error::InternalError(
                            "Steam client not initialized".into(),
                        ));
                    }
                };

                steam_client.install_game(steam_id).await?;
                self.mark_game_installed(game.id).await?;
                Ok(())
            }
            _ => {
                tracing::error!("No third party platform found for game: {:?}", game);
                Err(crate::error::Error::ThirdPartyNotFound)
            }
        }
    }

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

        let mut installed_games = HashMap::new();
        for dir in install_dir.read_dir()? {
            let dir = dir?;
            let game_id = match dir.file_name().to_string_lossy().parse::<i32>() {
                Ok(id) => id,
                _ => continue,
            };

            if dir.path().is_dir() {
                installed_games.insert(
                    game_id,
                    GameInstallationProgress {
                        game_id,
                        status: InstallationStatus::Installed,
                        ..Default::default()
                    },
                );
            }
        }

        self.installation_index
            .write()
            .await
            .extend(installed_games);

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

        let mut installed = HashMap::new();
        for (app_id, game_id) in
            games.into_iter().filter(|g| g.third_party).filter_map(|g| {
                match g.steam_app_id.map(u32::try_from).and_then(Result::ok) {
                    Some(app_id) => Some((app_id, g.id)),
                    None => None,
                }
            })
        {
            if steam.get_installation_status(app_id).await? == InstallationStatus::Installed {
                installed.insert(game_id, {
                    GameInstallationProgress {
                        game_id,
                        status: InstallationStatus::Installed,
                        ..Default::default()
                    }
                });
            }
        }

        self.installation_index.write().await.extend(installed);

        Ok(())
    }

    #[instrument(skip(self), fields(installation_progress))]
    pub async fn mark_game_installing(
        &self,
        installation_progress: GameInstallationProgress,
    ) -> crate::Result<()> {
        info!("Installing game: {}", installation_progress.game_id);

        if installation_progress.status != InstallationStatus::Installing {
            return Err(crate::error::Error::InternalError(
                "Installation status must be Installing".into(),
            ));
        }

        let game_id = installation_progress.game_id;
        let total_bytes = installation_progress.total_size as u64;

        {
            let mut installations = self.installation_index.write().await;
            for installation in installations
                .values_mut()
                .filter(|p| p.status == InstallationStatus::Installing && p.game_id != game_id)
            {
                installation.status = InstallationStatus::Paused;
            }

            installations.insert(game_id, installation_progress);
        }

        self.emit_update(InstallationProgressUpdate {
            game_id,
            event: InstallationEvent::Started.into(),
            metrics: Some(InstallationMetrics {
                bytes_per_second: 0.0,
                bytes_transferred: 0,
                total_bytes,
                percent_complete: 0,
            }),
            updated_at: Some(SystemTime::now().into()),
        })
        .await?;

        self.emit_index().await?;

        debug!("Game installation started: {}", game_id);

        Ok(())
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn mark_game_installed(&self, game_id: GameId) -> crate::Result<()> {
        info!("Marking game as installed: {}", game_id);

        self.installation_index
            .write()
            .await
            .get_mut(&game_id)
            .ok_or(crate::error::Error::InternalError(format!(
                "No installation found for game {game_id}"
            )))?
            .status = InstallationStatus::Installed;

        if let Some((game_id, progress)) = self
            .installation_index
            .write()
            .await
            .iter_mut()
            .find(|(_, p)| p.status == InstallationStatus::Paused && p.game_id != game_id)
        {
            progress.status = InstallationStatus::Installing;
        }

        self.emit_index().await?;

        Ok(())
    }

    #[instrument(skip(self))]
    pub async fn mark_game_uninstalled(&self, game_id: GameId) -> crate::Result<()> {
        info!("Marking game as uninstalled: {}", game_id);

        self.installation_index.write().await.remove(&game_id);
        self.emit_index().await?;

        Ok(())
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn get_game_installation_status(&self, game_id: GameId) -> InstallationStatus {
        trace!("Checking game installation status: {}", game_id);

        match self.installation_index.read().await.get(&game_id) {
            Some(progress) => progress.status,
            None => InstallationStatus::NotInstalled,
        }
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn get_game_installation_percent(&self, game_id: GameId) -> crate::Result<u32> {
        trace!("Checking game installation progress: {}", game_id);

        let installation = self.installation_index.read().await;
        let installation = installation
            .get(&game_id)
            .ok_or(crate::Error::InternalError(format!(
                "No current installation found for game {game_id}"
            )))?;

        let bytes_read: usize = installation.files.iter().map(|f| f.bytes_read).sum();

        let percent = bytes_read as f64 / installation.total_size as f64;
        let percent = (percent * 100.0).round() as u32;

        debug!(
            "Game installation progress: {bytes_read} / {} = {percent}%",
            installation.total_size
        );

        Ok(percent)
    }

    #[instrument(skip(self), fields(game_id, file_id, bytes_read))]
    pub async fn update_installation_progress(
        &self,
        game_id: GameId,
        file_id: FileId,
        bytes_read: usize,
    ) -> crate::Result<()> {
        debug!(
            "Updating installation progress: game {game_id} file {file_id} - {bytes_read} bytes read"
        );

        if let Some(file) = self
            .installation_index
            .write()
            .await
            .get_mut(&game_id)
            .and_then(|g| g.files.iter_mut().find(|f| f.file_id == file_id))
        {
            file.bytes_read += bytes_read;
        }

        self.emit_progress_update(game_id).await
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn mark_game_as_failed(&self, game_id: GameId) -> crate::Result<()> {
        info!("Marking installation of game {game_id} as failed");

        if let Some(entry) = self.installation_index.write().await.get_mut(&game_id) {
            entry.status = InstallationStatus::Failed;
        };

        if let Err(why) = self
            .emit_update(InstallationProgressUpdate {
                game_id,
                event: InstallationEvent::Failed.into(),
                metrics: None,
                updated_at: Some(SystemTime::now().into()),
            })
            .await
        {
            warn!("Failed to emit installation failed event: {}", why);
        }

        self.emit_index().await
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn emit_progress_update(&self, game_id: GameId) -> crate::Result<()> {
        let installations = self.installation_index.read().await;

        let current_installation =
            installations
                .get(&game_id)
                .ok_or(crate::Error::InternalError(format!(
                    "No current installation found for game {game_id}"
                )))?;

        let total_bytes = current_installation.total_size as u64;
        let bytes_transferred = current_installation
            .files
            .iter()
            .map(|f| f.bytes_read)
            .sum::<usize>() as u64;

        let previous_update = current_installation
            .updates
            .last()
            .ok_or(crate::Error::InternalError(
                "No previous installation update found".into(),
            ))?
            .clone();

        let previous_metrics = previous_update.metrics.as_ref();
        let previous_bytes_transferred = previous_metrics.map(|m| m.bytes_transferred).unwrap_or(0);
        let previous_percent = previous_metrics.map(|m| m.percent_complete).unwrap_or(0);

        let bytes_diff = bytes_transferred.saturating_sub(previous_bytes_transferred) as f64;
        let updated_at: Timestamp = SystemTime::now().into();

        let duration_as_secs = previous_update
            .updated_at
            .and_then(|prev| updated_at.elapsed_since(&prev))
            .ok_or(crate::Error::InternalError(
                "Failed to calculate duration since last update".into(),
            ))?
            .as_secs_f64();

        drop(installations);

        let percent = self.get_game_installation_percent(game_id).await?;

        if (percent <= previous_percent || duration_as_secs <= 0.0)
            && previous_update.event == i32::from(InstallationEvent::Progress)
        {
            debug!("percent: {percent}, previous_percent: {previous_percent}, secs: {duration_as_secs}");
            debug!("No progress made since last update, skipping emit.");
            return Ok(());
        }

        let bytes_per_second = bytes_diff / duration_as_secs;

        let progress = InstallationProgressUpdate {
            game_id,
            event: InstallationEvent::Progress.into(),
            metrics: Some(InstallationMetrics {
                percent_complete: percent,
                bytes_transferred,
                total_bytes,
                bytes_per_second,
            }),
            updated_at: Some(SystemTime::now().into()),
        };

        self.emit_update(progress).await
    }

    #[instrument(skip(self), fields(progress))]
    async fn emit_update(&self, progress: InstallationProgressUpdate) -> crate::Result<()> {
        debug!("Emitting installation progress: {:?}", progress);
        self.installation_index
            .write()
            .await
            .get_mut(&progress.game_id)
            .ok_or(crate::Error::InternalError(
                "No current installation found".into(),
            ))?
            .updates
            .push(progress.clone());

        let mut to_remove = Vec::new();
        let subs = self.progress_subscriptions.read().await;
        let encoded = progress.encode_to_vec();
        for channel in subs.iter() {
            if let Err(e) = channel.send(encoded.as_slice()) {
                tracing::error!("Error sending installation progress update: {}", e);
                to_remove.push(channel.id());
            }
        }

        if !to_remove.is_empty() {
            self.progress_subscriptions
                .write()
                .await
                .retain(|c| !to_remove.contains(&c.id()));
        }

        Ok(())
    }

    #[tracing::instrument(skip(self))]
    pub async fn get_installation_index(&self) -> crate::Result<InstallationIndex> {
        let app_handle = self.app_handle.clone();
        let server_config = app_handle.config_manager().get_config().await.server;

        let standalone = server_config
            .as_ref()
            .map(|s| s.standalone())
            .unwrap_or(false);

        let install_in_standalone = server_config
            .as_ref()
            .map(|s| s.install_games_in_standalone())
            .unwrap_or(false);

        let mut index = InstallationIndex::default();
        for progress in self.installation_index.read().await.values() {
            index
                .installations
                .insert(progress.game_id, progress.status.into());
        }

        // installation disabled for standalone mode,
        // consider all games installed
        if standalone && !install_in_standalone {
            let mut game_client = app_handle.get_game_client().await;
            let games = game_client
                .get_games(GetGamesRequest::default())
                .await
                .map_err(|e| crate::Error::Tonic(e.code()))?
                .into_inner()
                .games;

            games
                .into_iter()
                .filter(|g| !g.third_party)
                .for_each(|game| {
                    index
                        .installations
                        .insert(game.id, InstallationStatus::Installed.into());
                });
        }

        Ok(index)
    }

    #[instrument(skip(self))]
    pub async fn emit_index(&self) -> crate::Result<()> {
        let index = self.get_installation_index().await?;
        let subs = self.index_subscriptions.read().await;

        if !subs.is_empty() {
            let encoded = index.encode_to_vec();
            let mut to_remove = Vec::new();

            for sub in subs.iter() {
                let payload = encoded.as_slice();
                if let Err(why) = sub.send(payload) {
                    warn!("Failed to send installation index update: {}", why);
                    to_remove.push(sub.id());
                }
            }

            if !to_remove.is_empty() {
                self.index_subscriptions
                    .write()
                    .await
                    .retain(|c| !to_remove.contains(&c.id()));
            }
        }

        Ok(())
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
