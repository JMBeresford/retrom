use std::{collections::HashMap, path::PathBuf, sync::Arc};

use retrom_codegen::retrom::{
    GamePlayStatusUpdate, GetGameMetadataRequest, PlayStatus, UpdateGameMetadataRequest,
    UpdatedGameMetadata,
};
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Emitter, Runtime};
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
    pub send: Arc<Mutex<tokio::sync::mpsc::Sender<()>>>,
    pub start_time: std::time::SystemTime,
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

        info!("Marking game {game_id} as running");

        if already_running.is_some() {
            warn!("Game {game_id} is already running");
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

        info!("Marking game {game_id} as stopped");

        if child.is_none() {
            warn!("Game {game_id} is not running");
        }

        let mut metadata_client = self.app_handle.get_metadata_client().await;

        let req = tonic::Request::new(GetGameMetadataRequest {
            game_ids: vec![game_id],
        });

        let metadata_res = match metadata_client.get_game_metadata(req).await {
            Ok(res) => Some(res.into_inner()),
            Err(why) => {
                warn!("Failed to get game metadata: {:#?}", why);
                None
            }
        };

        let metadata = metadata_res.and_then(|res| res.metadata.into_iter().next());

        if let (Some(metadata), Some(child)) = (metadata, child) {
            // Use existing array members as we cannot define them as optional in the proto
            // definition.
            let mut updated_metadata = UpdatedGameMetadata {
                game_id,
                links: metadata.links,
                video_urls: metadata.video_urls,
                artwork_urls: metadata.artwork_urls,
                screenshot_urls: metadata.screenshot_urls,
                ..Default::default()
            };

            let now = std::time::SystemTime::now();

            updated_metadata.last_played = Some(now.into());
            let played = metadata.minutes_played.unwrap_or(0);

            let session_duration = now
                .duration_since(child.start_time)
                .ok()
                .map(|dur| dur.as_secs() / 60)
                .map(i32::try_from)
                .map(|res| res.ok().unwrap_or(0));

            if let Some(mins) = session_duration {
                info!("Game {game_id} played for {mins} minutes");
                updated_metadata.minutes_played = Some(played + mins);
            }

            let request = tonic::Request::new(UpdateGameMetadataRequest {
                metadata: vec![updated_metadata],
            });

            if let Err(why) = metadata_client.update_game_metadata(request).await {
                warn!("Failed to update game metadata: {:#?}", why);
            }
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

        info!("Stopping game {game_id}");

        if let Some(game) = game {
            game.send.lock().await.send(()).await?;

            info!("Game {game_id} stopped");
        }

        Ok(())
    }

    fn prepare_command(&self, executable: std::path::PathBuf) -> Command {
        #[cfg(not(target_os = "windows"))]
        {
            let base_cmd = if cfg!(feature = "flatpak") {
                // Must use flatpak-spawn to launch host executables from within a Flatpak
                let mut cmd = Command::new("flatpak-spawn");
                cmd.arg("--host").arg(executable);
                cmd
            } else {
                Command::new(executable)
            };

            base_cmd
        }

        #[cfg(target_os = "windows")]
        {
            let mut base_cmd = Command::new(executable);

            // Don't show the console window
            base_cmd.creation_flags(0x08000000);

            base_cmd
        }
    }

    pub(crate) fn get_open_cmd(&self, program: impl Into<PathBuf>) -> Command {
        let program: PathBuf = program.into();

        #[cfg(target_os = "macos")]
        {
            let program = if program.extension().is_some_and(|ext| ext == "app") {
                program.join("Contents/MacOS/").join(
                    program
                        .file_stem()
                        .unwrap_or_else(|| panic!("Failed to get file stem for file: {program:?}")),
                )
            } else {
                program
            };

            self.prepare_command(program)
        }

        #[cfg(not(target_os = "macos"))]
        {
            self.prepare_command(program)
        }
    }
}
