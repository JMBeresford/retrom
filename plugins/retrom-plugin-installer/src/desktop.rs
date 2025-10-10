use futures::TryStreamExt;
use prost::Message;
use reqwest::header::ACCESS_CONTROL_ALLOW_ORIGIN;
use retrom_codegen::{
    retrom::{
        client::installation::{
            InstallGamePayload, InstallationIndex, InstallationMetrics, InstallationProgressUpdate,
            InstallationStatus,
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
    pub files: Vec<FileInstallationProgress>,
    pub status: InstallationStatus,
    pub metrics: Option<InstallationMetrics>,
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

        let total_bytes: u64 = files.iter().map(|f| f.byte_size as u64).sum();

        let installation = GameInstallationProgress {
            game_id: game.id,
            status: InstallationStatus::Installing,
            metrics: Some(InstallationMetrics {
                bytes_per_second: 0.0,
                bytes_transferred: 0,
                total_bytes,
                percent_complete: 0,
                updated_at: Some(SystemTime::now().into()),
            }),
            files: files
                .iter()
                .map(|f| FileInstallationProgress {
                    file_id: f.id,
                    bytes_read: 0,
                    total_size: f.byte_size as usize,
                })
                .collect(),
        };

        self.installation_index
            .write()
            .await
            .insert(game.id, installation);

        self.mark_game_installing(game.id).await?;

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
                            if let Some(progress) =
                                installer.installation_index.read().await.get(&game.id)
                            {
                                match progress.status {
                                    InstallationStatus::Installing => {}
                                    InstallationStatus::Paused => {
                                        trace!("Installation paused");
                                        continue;
                                    }
                                    InstallationStatus::Installed => {
                                        debug!("Installation already marked as completed");
                                        break;
                                    }
                                    InstallationStatus::Failed => {
                                        return Err(crate::error::Error::InstallationAborted);
                                    }
                                    InstallationStatus::Aborted => {
                                        return Err(crate::error::Error::InstallationAborted);
                                    }
                                    _ => {
                                        return Err(crate::error::Error::InternalError(
                                            "Invalid installation status".into(),
                                        ));
                                    }
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

                            if let Some(progress) =
                                installer.installation_index.write().await.get_mut(&game_id)
                            {
                                if let Some(file) =
                                    progress.files.iter_mut().find(|f| f.file_id == file_id)
                                {
                                    file.bytes_read += bytes.len();
                                }
                            }

                            let percent_complete =
                                installer.get_game_installation_percent(game_id).await?;

                            let previous_metrics = {
                                let installations_lock = installer.installation_index.read().await;

                                let progress = installations_lock.get(&game_id).ok_or(
                                    crate::Error::InternalError(
                                        "No current installation found for game".into(),
                                    ),
                                )?;

                                progress.metrics.ok_or(crate::Error::InternalError(
                                    "No installation metrics found".into(),
                                ))?
                            };

                            if percent_complete > previous_metrics.percent_complete {
                                let bytes_transferred = installer
                                    .installation_index
                                    .read()
                                    .await
                                    .get(&game_id)
                                    .ok_or(crate::Error::InternalError(
                                        "No current installation found for game".into(),
                                    ))?
                                    .files
                                    .iter()
                                    .map(|f| f.bytes_read)
                                    .sum::<usize>()
                                    as u64;

                                let bytes_diff = bytes_transferred
                                    .saturating_sub(previous_metrics.bytes_transferred)
                                    as f64;

                                let updated_at: Timestamp = SystemTime::now().into();

                                let duration_as_secs = updated_at
                                    .elapsed_since(&previous_metrics.updated_at.unwrap_or_default())
                                    .ok_or(crate::Error::InternalError(
                                        "Failed to calculate duration since last update".into(),
                                    ))?
                                    .as_secs_f64();

                                if percent_complete > previous_metrics.percent_complete
                                    && duration_as_secs >= 1.0
                                    && bytes_diff > 0.0
                                {
                                    match installer
                                        .installation_index
                                        .write()
                                        .await
                                        .get_mut(&game_id)
                                    {
                                        Some(progress) => {
                                            progress.metrics = Some(InstallationMetrics {
                                                bytes_transferred,
                                                percent_complete,
                                                total_bytes: previous_metrics.total_bytes,
                                                bytes_per_second: bytes_diff / duration_as_secs,
                                                updated_at: Some(updated_at),
                                            });
                                        }
                                        None => {
                                            return Err(crate::Error::InternalError(
                                                "No current installation found for game".into(),
                                            ))
                                        }
                                    }

                                    installer.emit_update(game_id).await?;
                                };
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

            match futures::future::try_join_all(futures).await {
                Ok(_) => {
                    debug!("All files downloaded for game: {}", game.id);
                    app_handle.installer().mark_game_installed(game_id).await?;
                }
                Err(crate::error::Error::InstallationAborted) => {
                    info!("Installation aborted for game: {}", game.id);
                    app_handle
                        .installer()
                        .handle_uninstallation(game_id)
                        .await?;
                }
                _ => {
                    warn!("Installation failed for game: {}", game.id);
                    app_handle.installer().mark_game_as_failed(game_id).await?;
                    app_handle
                        .installer()
                        .handle_uninstallation(game_id)
                        .await?;
                }
            }

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

    pub(crate) async fn handle_uninstallation(&self, game_id: GameId) -> crate::Result<()> {
        let app_handle = self.app_handle.clone();
        let mut game_client = app_handle.get_game_client().await;

        let game = game_client
            .get_games(GetGamesRequest {
                ids: vec![game_id],
                ..Default::default()
            })
            .await?
            .into_inner()
            .games
            .into_iter()
            .next()
            .ok_or_else(|| {
                crate::error::Error::InternalError(format!("Game with id {game_id} not found"))
            })?;

        if game.third_party {
            if let Some(Ok(steam_id)) = game.steam_app_id.map(u32::try_from) {
                let steam_client = match app_handle.steam() {
                    Some(client) => client,
                    None => {
                        tracing::error!("Steam client not initialized");
                        return Err(crate::error::Error::InternalError(
                            "Steam client not initialized".into(),
                        ));
                    }
                };

                steam_client.uninstall_game(steam_id).await?;

                return Ok(());
            }
        } else {
            let install_dir = self.get_installation_dir().await?;
            let output_directory = install_dir.join(game.id.to_string());

            if output_directory.try_exists()? {
                tokio::fs::remove_dir_all(&output_directory).await?;
            }
        }

        self.mark_game_uninstalled(game.id).await
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
                installed.insert(
                    game_id,
                    GameInstallationProgress {
                        game_id,
                        status: InstallationStatus::Installed,
                        ..Default::default()
                    },
                );
            }
        }

        self.installation_index.write().await.extend(installed);

        Ok(())
    }

    #[instrument(skip(self), fields(installation_progress))]
    pub async fn mark_game_installing(&self, game_id: GameId) -> crate::Result<()> {
        info!("Installing game: {}", game_id);

        let ids_to_pause = {
            let index = self.installation_index.read().await;

            index
                .iter()
                .filter_map(|(id, progress)| {
                    if progress.status == InstallationStatus::Installing && id != &game_id {
                        Some(*id)
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>()
        };

        match self.installation_index.write().await.get_mut(&game_id) {
            Some(progress) => {
                progress.status = InstallationStatus::Installing;
                if let Some(metrics) = progress.metrics.as_mut() {
                    metrics.updated_at = Some(SystemTime::now().into());
                    metrics.bytes_per_second = 0.0;
                }
            }
            None => {
                return Err(crate::error::Error::InternalError(format!(
                    "No installation found for game {game_id}"
                )))
            }
        };

        futures::future::join_all(
            ids_to_pause
                .into_iter()
                .map(|id| async move { self.pause_game_installation(id).await }),
        )
        .await;

        self.emit_update(game_id).await?;
        self.emit_index().await?;

        debug!("Game installation started: {}", game_id);

        Ok(())
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn pause_game_installation(&self, game_id: GameId) -> crate::Result<()> {
        info!("Pausing installation of game: {}", game_id);

        match self.installation_index.write().await.get_mut(&game_id) {
            Some(progress) => {
                if progress.status == InstallationStatus::Installing {
                    progress.status = InstallationStatus::Paused;
                    if let Some(metrics) = progress.metrics.as_mut() {
                        metrics.updated_at = Some(SystemTime::now().into());
                        metrics.bytes_per_second = 0.0;
                    }
                }
            }
            None => {
                return Err(crate::error::Error::InternalError(format!(
                    "No installation found for game {game_id}"
                )))
            }
        };

        self.emit_update(game_id).await?;
        self.emit_index().await?;

        Ok(())
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn mark_game_installed(&self, game_id: GameId) -> crate::Result<()> {
        info!("Marking game as installed: {}", game_id);

        {
            let mut index = self.installation_index.write().await;
            let progress = index
                .get_mut(&game_id)
                .ok_or(crate::error::Error::InternalError(format!(
                    "No installation found for game {game_id}"
                )))?;

            let total_bytes: u64 =
                progress.files.iter().map(|f| f.total_size).sum::<usize>() as u64;

            progress.status = InstallationStatus::Installed;
            progress.metrics = Some(InstallationMetrics {
                bytes_per_second: 0.0,
                bytes_transferred: total_bytes,
                total_bytes,
                percent_complete: 100,
                updated_at: Some(SystemTime::now().into()),
            });
        }

        self.emit_update(game_id).await?;
        self.emit_index().await?;

        let id_to_resume = self
            .installation_index
            .read()
            .await
            .iter()
            .find(|(id, progress)| progress.status == InstallationStatus::Paused && *id != &game_id)
            .map(|(id, _)| *id);

        if let Some(id) = id_to_resume {
            self.mark_game_installing(id).await?;
        }

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

        let index = self.installation_index.read().await;
        let progress = index
            .get(&game_id)
            .ok_or(crate::Error::InternalError(format!(
                "No current installation found for game {game_id}"
            )))?;

        let metrics = match progress.metrics.as_ref() {
            Some(metrics) => metrics,
            None => {
                return Err(crate::Error::InternalError(
                    "No installation metrics found".into(),
                ))
            }
        };

        let bytes_read: usize = progress.files.iter().map(|f| f.bytes_read).sum();

        let percent = bytes_read as f64 / metrics.total_bytes as f64;
        let percent = (percent * 100.0).round() as u32;

        trace!(
            "Game installation progress: {bytes_read} / {} = {percent}%",
            metrics.total_bytes
        );

        Ok(percent)
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn mark_game_as_aborted(&self, game_id: GameId) -> crate::Result<()> {
        info!("Marking installation as aborted");

        if let Some(progress) = self.installation_index.write().await.get_mut(&game_id) {
            progress.status = InstallationStatus::Aborted;
        };

        if let Err(why) = self.emit_update(game_id).await {
            warn!("Failed to emit installation failed event: {}", why);
        }

        debug!("Installation marked as aborted");

        self.emit_index().await
    }

    #[instrument(skip(self), fields(game_id))]
    pub(crate) async fn mark_game_as_failed(&self, game_id: GameId) -> crate::Result<()> {
        info!("Marking installation as failed");

        if let Some(progress) = self.installation_index.write().await.get_mut(&game_id) {
            progress.status = InstallationStatus::Failed;
        };

        if let Err(why) = self.emit_update(game_id).await {
            warn!("Failed to emit installation failed event: {}", why);
        }

        debug!("Installation marked as failed");

        self.emit_index().await
    }

    #[instrument(skip(self), fields(progress))]
    async fn emit_update(&self, game_id: GameId) -> crate::Result<()> {
        let mut to_remove = Vec::new();
        match self.installation_index.read().await.get(&game_id) {
            Some(progress) => {
                debug!("Emitting installation progress: {:?}", progress);
                let subs = self.progress_subscriptions.read().await;
                let update = InstallationProgressUpdate {
                    game_id,
                    status: progress.status.into(),
                    metrics: progress.metrics,
                };

                let encoded = update.encode_to_vec();
                for channel in subs.iter() {
                    if let Err(e) = channel.send(encoded.as_slice()) {
                        tracing::error!("Error sending installation progress update: {}", e);
                        to_remove.push(channel.id());
                    }
                }
            }
            None => {
                return Err(crate::error::Error::InternalError(format!(
                    "No installation found for game {game_id}"
                )))
            }
        };

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
