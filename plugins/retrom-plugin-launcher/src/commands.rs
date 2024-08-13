use std::{ffi::OsStr, path::PathBuf};

use retrom_codegen::retrom::{
    GamePlayStatusUpdate, GetGamePlayStatusPayload, InstallationStatus, PlayGamePayload,
    PlayStatus, StopGamePayload,
};
use retrom_plugin_installer::InstallerExt;
use tauri::{command, AppHandle, Runtime};
use tokio::sync::Mutex;
use tracing::{info, instrument};

use crate::{desktop::GameProcess, LauncherExt, Result};

#[command]
#[instrument(skip_all)]
pub(crate) async fn play_game<R: Runtime>(
    app: AppHandle<R>,
    payload: PlayGamePayload,
) -> Result<()> {
    let launcher = app.launcher();
    let installer = app.installer();

    let game = match payload.game {
        Some(game) => game,
        None => return Err(crate::Error::GameNotFound(None)),
    };

    let game_id = game.id;
    let profile = payload.emulator_profile.unwrap();

    if installer.get_game_installation_status(game_id).await != InstallationStatus::Installed {
        return Err(crate::Error::NotInstalled(game_id));
    }

    let install_dir = match installer.get_game_installation_path(game_id).await {
        Some(path) => path,
        None => return Err(crate::Error::NotInstalled(game_id)),
    };

    let files: Vec<PathBuf> = install_dir
        .as_path()
        .read_dir()?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .collect();

    let file = files
        .into_iter()
        .find(|file| {
            profile.supported_extensions.iter().any(|ext| {
                file.file_name()
                    .and_then(OsStr::to_str)
                    .map(|name| name.ends_with(ext))
                    .unwrap_or(false)
            })
        })
        .ok_or_else(|| crate::Error::FileNotFound(game_id))?;

    let file_path = match file.canonicalize()?.to_str() {
        Some(path) => path.to_string(),
        None => return Err(crate::Error::FileNotFound(game_id)),
    };

    let mut cmd = launcher.get_open_cmd(&profile.executable_path);

    let args = if !profile.custom_args.is_empty() {
        profile
            .custom_args
            .into_iter()
            .map(|arg| arg.replace("{file}", &file_path))
            .collect()
    } else {
        vec![file_path]
    };

    cmd.args(args);

    let (send, mut recv) = tokio::sync::mpsc::channel(1);
    let mut process = cmd.spawn()?;
    let send = Mutex::new(send);

    launcher
        .mark_game_as_running(
            game_id,
            GameProcess {
                send,
                start_time: std::time::SystemTime::now(),
            },
        )
        .await?;

    let app = app.clone();
    tokio::select! {
        _ = recv.recv() => {
            info!("Recieved stop signal for game {}", game_id);

            process.kill().await?;
            info!("Killed game process for game {}", game_id);

            app.launcher().mark_game_as_stopped(game_id).await?;
        }
        _ = process.wait() => {
            info!("Game process for game {} was exited", game_id);

            app.launcher()
                .mark_game_as_stopped(game_id)
                .await
                .expect("Error stopping game");
        }
    };

    Ok(())
}

#[command]
#[instrument(skip_all)]
pub(crate) async fn stop_game<R: Runtime>(
    app: AppHandle<R>,
    payload: StopGamePayload,
) -> Result<()> {
    let launcher = app.launcher();
    let game = payload.game;

    let game_id = match game {
        Some(game) => game.id,
        None => return Err(crate::Error::GameNotFound(None)),
    };

    launcher.stop_game(game_id).await?;

    Ok(())
}

#[command]
#[instrument(skip_all)]
pub(crate) async fn get_game_play_status<R: Runtime>(
    app: AppHandle<R>,
    payload: GetGamePlayStatusPayload,
) -> Result<GamePlayStatusUpdate> {
    let launcher = app.launcher();
    let game = payload.game;

    let game_id = match &game {
        Some(game) => game.id,
        None => return Err(crate::Error::GameNotFound(None)),
    };

    if launcher.is_game_running(game_id).await {
        Ok(GamePlayStatusUpdate {
            game_id,
            play_status: PlayStatus::Playing.into(),
        })
    } else {
        Ok(GamePlayStatusUpdate {
            game_id,
            play_status: PlayStatus::NotPlaying.into(),
        })
    }
}
