use std::{collections::HashMap, path::PathBuf};

use retrom_codegen::retrom::{GamePlayStatusUpdate, PlayStatus};
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Manager, Runtime};
use tokio::{
    process::Command,
    sync::{Mutex, RwLock},
};
use tracing::{info, instrument, warn};

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Launcher<R>> {
    Ok(Launcher::new(app.clone()))
}

type GameId = i32;
pub struct GameProcess {
    pub send: Mutex<tokio::sync::mpsc::Sender<()>>,
}

/// Access to the launcher APIs.
pub struct Launcher<R: Runtime> {
    app_handle: AppHandle<R>,
    pub child_processes: RwLock<HashMap<GameId, GameProcess>>,
}

impl<R: Runtime> Launcher<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        Self {
            app_handle,
            child_processes: RwLock::new(HashMap::new()),
        }
    }

    #[instrument(skip_all)]
    pub async fn is_game_running(&self, game_id: GameId) -> bool {
        self.child_processes.read().await.contains_key(&game_id)
    }

    #[instrument(skip_all)]
    pub async fn mark_game_as_running(
        &self,
        game_id: GameId,
        child: GameProcess,
    ) -> crate::Result<()> {
        let already_running = self.child_processes.write().await.insert(game_id, child);

        info!("Marking game {} as running", game_id);

        if already_running.is_some() {
            warn!("Game {} is already running", game_id);
        }

        self.app_handle.emit(
            "game-running",
            GamePlayStatusUpdate {
                game_id,
                play_status: PlayStatus::Playing.into(),
            },
        )?;

        Ok(())
    }

    #[instrument(skip_all)]
    pub async fn mark_game_as_stopped(&self, game_id: GameId) -> crate::Result<()> {
        let child = self.child_processes.write().await.remove(&game_id);

        info!("Marking game {} as stopped", game_id);

        if child.is_none() {
            warn!("Game {} is not running", game_id);
        }

        self.app_handle.emit(
            "game-stopped",
            GamePlayStatusUpdate {
                game_id,
                play_status: PlayStatus::NotPlaying.into(),
            },
        )?;

        Ok(())
    }

    #[instrument(skip_all)]
    pub async fn stop_game(&self, game_id: GameId) -> crate::Result<()> {
        let all_processes = self.child_processes.read().await;
        let game = all_processes.get(&game_id);

        info!("Stopping game {}", game_id);

        if let Some(game) = game {
            game.send.lock().await.send(()).await?;

            info!("Game {} stopped", game_id);
        }

        Ok(())
    }

    pub(crate) fn get_open_cmd(&self, program: &str) -> Command {
        #[cfg(target_os = "macos")]
        {
            let path: PathBuf = PathBuf::from(program);
            let program = if path.extension().is_some_and(|ext| ext == "app") {
                path.join("Contents/MacOS/").join(path.file_stem().unwrap())
            } else {
                path
            };

            let cmd = Command::new(program);

            cmd
        }
        #[cfg(target_os = "windows")]
        {
            let mut cmd = Command::new(program);

            // Don't show the console window
            cmd.creation_flags(0x08000000);

            cmd
        }
        #[cfg(target_os = "linux")]
        {
            let mut cmd = Command::new(program);

            cmd
        }
    }
}
