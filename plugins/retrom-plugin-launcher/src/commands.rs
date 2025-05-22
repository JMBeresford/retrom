use std::{ffi::OsStr, path::PathBuf};

use retrom_codegen::retrom::{
    GamePlayStatusUpdate, GetGamePlayStatusPayload, GetLocalEmulatorConfigsRequest,
    InstallationStatus, PlayGamePayload, PlayStatus, StopGamePayload,
};
use retrom_plugin_config::ConfigExt;
use retrom_plugin_installer::InstallerExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use tauri::{command, AppHandle, Runtime};
use tauri_plugin_opener::OpenerExt;
use tokio::sync::Mutex;
use tracing::{info, instrument};
use walkdir::WalkDir;

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
    let maybe_default_game_file = payload.file;
    let emulator = payload.emulator;
    
    // Handle the case when no emulator profile is provided
    let use_system_default = payload.emulator_profile.is_none();

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

    let fallback_file = if use_system_default {
        // When using system default, just find any file if default is not specified
        files.iter().find(|file| Some(*file) != maybe_default_file.as_ref())
    } else {
        // Original behavior for emulator profiles
        let profile = payload.emulator_profile.as_ref().unwrap();
        match profile.supported_extensions.is_empty() {
            true => files
                .iter()
                .find(|file| Some(*file) != maybe_default_file.as_ref()),
            false => files.iter().find(|file| {
                profile
                    .supported_extensions
                    .iter()
                    .any(|ext| file.extension().and_then(OsStr::to_str) == Some(ext.as_str()))
            }),
        }
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

    // Create process to track game play time
    let (send, mut recv) = tokio::sync::mpsc::channel(1);
    let send = Mutex::new(send);
    
    if use_system_default {
        // Use system default application to open the file
        tracing::info!("Opening file with system default application: {}", file_path);
        app.opener().open_path(file_path, None::<&str>)?;
        
        // Mark game as running
        launcher
            .mark_game_as_running(
                game_id,
                GameProcess {
                    send,
                    start_time: std::time::SystemTime::now(),
                },
            )
            .await?;
            
        // We can't track when the user closes the application when using system default,
        // so we'll wait for a stop command or set a reasonable timeout
        let app = app.clone();
        tokio::select! {
            _ = recv.recv() => {
                info!("Received stop signal for game {}", game_id);
                app.launcher().mark_game_as_stopped(game_id).await?;
            }
            // Default behavior is to keep the game marked as running until explicitly stopped
        };
    } else {
        // Original flow for emulator-based launching
        let profile = payload.emulator_profile.unwrap();
        let emulator = emulator.expect("No emulator provided");
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

        let mut process = cmd.spawn()?;
        
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
                info!("Received stop signal for game {}", game_id);

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
    }

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
