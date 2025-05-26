use std::{ffi::OsStr, path::PathBuf};

use prost::Message;
use retrom_codegen::retrom::{
    GamePlayStatusUpdate, GetGamePlayStatusPayload, GetLocalEmulatorConfigsRequest,
    InstallationStatus, PlayGamePayload, PlayStatus, StopGamePayload,
};
use retrom_plugin_config::ConfigExt;
use retrom_plugin_installer::InstallerExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use tauri::{command, AppHandle, Runtime};
use tokio::sync::Mutex;
use tracing::{info, instrument};
use walkdir::WalkDir;

use crate::{desktop::GameProcess, LauncherExt, Result};

#[command]
#[instrument(skip_all)]
pub(crate) async fn play_game<R: Runtime>(app: AppHandle<R>, payload: Vec<u8>) -> Result<()> {
    let payload = PlayGamePayload::decode(payload.as_slice())?;
    let launcher = app.launcher();
    let installer = app.installer();
    let standalone = app
        .config_manager()
        .get_config()
        .await
        .server
        .and_then(|s| s.standalone)
        .unwrap_or(false);

    let game = match payload.game {
        Some(game) => game,
        None => return Err(crate::Error::GameNotFound(None)),
    };

    if game.third_party {
        let steam = match app.steam() {
            Some(steam) => steam,
            None => {
                return Err(crate::Error::InternalError(
                    "Steam is not initialized".into(),
                ))
            }
        };

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
    let maybe_default_game_file = payload.file;

    let maybe_default_file = maybe_default_game_file
        .clone()
        .map(|file| file.path)
        .map(PathBuf::from);

    if !standalone
        && installer.get_game_installation_status(game_id).await != InstallationStatus::Installed
    {
        return Err(crate::Error::NotInstalled(game_id));
    }

    let install_dir = match standalone {
        true => PathBuf::from(&game.path),
        false => match installer.get_game_installation_path(game_id).await {
            Some(path) => path,
            None => return Err(crate::Error::NotInstalled(game_id)),
        },
    };

    let mut files: Vec<PathBuf> = WalkDir::new(&install_dir)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.into_path())
        .filter(|p| p.is_file())
        .collect();

    files.sort();

    tracing::debug!("Files: {:?}", files);
    tracing::debug!("Default file: {:?}", &maybe_default_file);

    let fallback_file = match profile.supported_extensions.is_empty() {
        true => files
            .iter()
            .find(|file| Some(*file) != maybe_default_file.as_ref()),
        false => files.iter().find(|file| {
            profile
                .supported_extensions
                .iter()
                .any(|ext| file.extension().and_then(OsStr::to_str) == Some(ext.as_str()))
        }),
    };

    tracing::debug!("Fallback file: {:?}", fallback_file);

    let relative_to_install_dir = maybe_default_file
        .as_deref()
        .and_then(|f| f.strip_prefix(&game.path).ok());

    let file_path = match files
        .iter()
        .find(|f| f.strip_prefix(&install_dir).ok() == relative_to_install_dir)
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

    let client_config = app.config_manager().get_config().await;

    let client_id = client_config
        .config
        .and_then(|c| c.client_info.map(|info| info.id))
        .expect("Client ID not found");

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
        #[allow(clippy::literal_string_with_formatting_args)]
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
            info!("Recieved stop signal for game {game_id}");

            process.kill().await?;
            info!("Killed game process for game {game_id}");

            app.launcher().mark_game_as_stopped(game_id).await?;
        }
        _ = process.wait() => {
            info!("Game process for game {game_id} was exited");

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
pub(crate) async fn stop_game<R: Runtime>(app: AppHandle<R>, payload: Vec<u8>) -> Result<()> {
    let payload = StopGamePayload::decode(payload.as_slice())?;
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
    payload: Vec<u8>,
) -> Result<Vec<u8>> {
    let launcher = app.launcher();
    let payload = GetGamePlayStatusPayload::decode(payload.as_slice())?;
    let game = payload.game;

    let game_id = match &game {
        Some(game) => game.id,
        None => return Err(crate::Error::GameNotFound(None)),
    };

    let res = if launcher.is_game_running(game_id).await {
        GamePlayStatusUpdate {
            game_id,
            play_status: PlayStatus::Playing.into(),
        }
    } else {
        GamePlayStatusUpdate {
            game_id,
            play_status: PlayStatus::NotPlaying.into(),
        }
    };

    Ok(res.encode_to_vec())
}
