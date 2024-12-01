use serde::de::DeserializeOwned;
use std::{
    collections::{HashMap, HashSet},
    fs::create_dir,
    path::PathBuf,
};
use tauri::{plugin::PluginApi, AppHandle, Emitter, Manager, Runtime};
use tracing::{debug, info, instrument, trace};

use retrom_codegen::retrom::{InstallationProgressUpdate, InstallationStatus};
use tokio::sync::RwLock;

#[instrument(skip(app, _api))]
pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Installer<R>> {
    let app_data = app.path().app_data_dir()?;

    if !app_data.try_exists().unwrap() {
        tracing::info!("Creating app data directory.");
        create_dir(&app_data)?;
    };

    let install_dir = app_data.join("installed");

    if !install_dir.try_exists().unwrap() {
        tracing::info!("Creating install directory.");
        create_dir(&install_dir)?;
    };

    let mut installed_games = HashSet::new();
    for dir in install_dir.read_dir()? {
        let dir = dir?;
        let game_id = dir.file_name().to_string_lossy().parse::<i32>();

        if game_id.is_err() {
            continue;
        }

        if dir.path().is_dir() {
            installed_games.insert(game_id?);
        }
    }

    let installer = Installer {
        app_handle: app.clone(),
        installation_directory: RwLock::new(install_dir),
        installed_games: RwLock::new(installed_games),
        currently_installing: RwLock::new(HashMap::new()),
    };

    Ok(installer)
}

type GameId = i32;
type FileId = i32;

#[derive(Debug)]
pub struct Installer<R: Runtime> {
    app_handle: AppHandle<R>,
    pub(crate) installation_directory: RwLock<PathBuf>,
    pub(crate) installed_games: RwLock<HashSet<GameId>>,
    pub(crate) currently_installing: RwLock<HashMap<GameId, GameInstallationProgress>>,
}

impl<R: Runtime> Installer<R> {
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

        if self
            .currently_installing
            .read()
            .await
            .contains_key(&game_id)
        {
            InstallationStatus::Installing
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

    #[instrument(skip(self), fields(game_id, file_id, bytes_read))]
    pub async fn update_installation_progress(
        &self,
        game_id: GameId,
        file_id: FileId,
        bytes_read: usize,
    ) {
        trace!(
            "Updating installation progress: game {} file {} - {} bytes read",
            game_id,
            file_id,
            bytes_read
        );

        let cur_percent = self.get_game_installation_percent(game_id).await.unwrap();

        {
            let mut installation = self.currently_installing.write().await;
            let installation = installation.get_mut(&game_id).unwrap();
            let file = installation
                .files
                .iter_mut()
                .find(|f| f.file_id == file_id)
                .unwrap();

            file.bytes_read += bytes_read;
        }

        let new_percent = self.get_game_installation_percent(game_id).await.unwrap();
        let progress = InstallationProgressUpdate {
            game_id,
            progress: new_percent,
        };

        if new_percent != cur_percent {
            self.app_handle
                .emit("install-progress", progress)
                .expect("Error emitting event");
        }
    }

    #[instrument(skip(self), fields(game_id))]
    pub async fn get_game_installation_path(&self, game_id: GameId) -> Option<PathBuf> {
        trace!("Getting game installation path: {}", game_id);

        let install_dir = self.installation_directory.read().await;
        let game_dir = install_dir.join(game_id.to_string());

        if game_dir.try_exists().unwrap() {
            Some(game_dir)
        } else {
            None
        }
    }
}

#[derive(Debug)]
pub struct FileInstallationProgress {
    pub file_id: FileId,
    pub bytes_read: usize,
    pub total_size: usize,
}

#[derive(Debug)]
pub struct GameInstallationProgress {
    pub game_id: GameId,
    pub files: Vec<FileInstallationProgress>,
}
