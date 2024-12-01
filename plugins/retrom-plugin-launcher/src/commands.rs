use std::{ffi::OsStr, path::PathBuf};

use retrom_codegen::retrom::{
    GamePlayStatusUpdate, GetGamePlayStatusPayload, GetLocalEmulatorConfigsRequest,
    InstallationStatus, PlayGamePayload, PlayStatus, RetromClientConfig, StopGamePayload,
};
use retrom_plugin_installer::InstallerExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use tauri::{command, AppHandle, Manager, Runtime};
use tokio::sync::Mutex;
use tracing::{info, instrument};

use crate::{desktop::GameProcess, LauncherExt, Result};

#[command]
#[instrument(skip_all, fields(
    game_id = payload.game.as_ref().map(|game| game.id),
    emulator_profile_id = payload.emulator_profile.as_ref().map(|profile| profile.id)))]
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

    if game.third_party {
        let steam = app.steam();

        if let Some(Ok(app_id)) = game.steam_app_id.map(u32::try_from) {
            steam.launch_game(app_id).await?;
            return Ok(());
        }
    }

    let game_id = game.id;
    let profile = payload
        .emulator_profile
        .expect("No emulator profile provided");
    let emulator = payload.emulator.expect("No emulator provided");
    let maybe_default_file = payload.file;

    let default_file_path = maybe_default_file
        .clone()
        .map(|file| file.path)
        .map(PathBuf::from)
        .map(|path| {
            path.file_name()
                .expect("Could not get file name")
                .to_owned()
        });

    if installer.get_game_installation_status(game_id).await != InstallationStatus::Installed {
        return Err(crate::Error::NotInstalled(game_id));
    }

    let install_dir = match installer.get_game_installation_path(game_id).await {
        Some(path) => path,
        None => return Err(crate::Error::NotInstalled(game_id)),
    };

    let mut files: Vec<PathBuf> = install_dir
        .as_path()
        .read_dir()?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .collect();

    files.sort();

    tracing::debug!("Files: {:?}", files);
    tracing::debug!("Default file: {:?}", maybe_default_file);

    let fallback_file = files.iter().find(|file| {
        profile.supported_extensions.iter().any(|ext| {
            file.file_name()
                .and_then(OsStr::to_str)
                .map(|name| name.ends_with(ext))
                .unwrap_or(false)
        })
    });

    tracing::debug!("Fallback file: {:?}", fallback_file);

    let file_path = match files
        .iter()
        .find(|f| f.file_name() == default_file_path.as_deref())
    {
        Some(file) => file,
        None => match fallback_file {
            Some(file) => file,
            None => return Err(crate::Error::FileNotFound(game_id)),
        },
    };

    tracing::debug!("File path: {:?}", file_path);

    let file_path = match file_path.canonicalize()?.to_str() {
        Some(path) => path.to_string(),
        None => return Err(crate::Error::FileNotFound(game_id)),
    };

    let install_dir = match install_dir.canonicalize()?.to_str() {
        Some(path) => path.to_string(),
        None => return Err(crate::Error::FileNotFound(game_id)),
    };

    let client_id: i32;

    {
        let config_state = app
            .try_state::<std::sync::Mutex<RetromClientConfig>>()
            .expect("Config not found");

        let lock = config_state.lock().expect("Failed to lock config");

        client_id = lock
            .config
            .as_ref()
            .and_then(|c| c.client_info.as_ref())
            .map(|c| c.id)
            .unwrap_or(0);
    }

    let mut emulator_client = app.get_emulator_client().await;
    let res = emulator_client
        .get_local_emulator_configs(GetLocalEmulatorConfigsRequest {
            client_id,
            emulator_ids: vec![emulator.id],
        })
        .await
        .expect("Failed to get local emulator configs")
        .into_inner();

    let local_config = res.configs.first().expect("No emulator config found");

    let mut cmd = launcher.get_open_cmd(&local_config.executable_path);

    let args = if !profile.custom_args.is_empty() {
        profile
            .custom_args
            .into_iter()
            .map(|arg| match arg.starts_with("\"") && arg.ends_with("\"") {
                false => arg,
                true => arg[1..arg.len() - 1].to_string(),
            })
            .map(|arg| match arg.starts_with("'") && arg.ends_with("'") {
                false => arg,
                true => arg[1..arg.len() - 1].to_string(),
            })
            .map(|arg| arg.replace("{file}", &file_path))
            .map(|arg| arg.replace("{install_dir}", &install_dir))
            .collect()
    } else {
        vec![file_path]
    };

    info!("Args Constructed: {:?}", args);

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
#[instrument(skip_all, fields(game_id = payload.game.as_ref().map(|game| game.id)))]
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
