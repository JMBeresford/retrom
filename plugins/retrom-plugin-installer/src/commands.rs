use futures::TryStreamExt;
use prost::Message;
use reqwest::header::ACCESS_CONTROL_ALLOW_ORIGIN;
use retrom_codegen::retrom::{
    GetPlatformsRequest, InstallGamePayload, InstallationState, InstallationStatus, StorageType,
    UninstallGamePayload,
};
use retrom_plugin_config::ConfigExt;
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use std::{collections::HashMap, path::PathBuf};
use tauri::{AppHandle, Runtime};
use tauri_plugin_opener::OpenerExt;
use tokio::io::AsyncWriteExt;
use tracing::{info, instrument};

use crate::{
    desktop::{FileInstallationProgress, GameInstallationProgress},
    InstallerExt,
};

#[instrument(skip_all)]
#[tauri::command]
pub async fn install_game<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: Vec<u8>,
) -> crate::Result<()> {
    let payload = InstallGamePayload::decode(payload.as_slice())?;
    let game = payload.game.unwrap();
    let files = payload.files;
    let installer = app_handle.installer();

    let install_dir = installer.get_installation_dir().await?;
    let output_directory = install_dir.join(game.id.to_string());

    if !(output_directory.try_exists()?) {
        std::fs::create_dir_all(&output_directory)?;
    }

    if game.third_party {
        let mut platform_svc_client = app_handle.get_platform_client().await;

        let steam_id = u32::try_from(game.steam_app_id()).expect("Could not convert steam id");

        let platform_res = platform_svc_client
            .get_platforms(GetPlatformsRequest {
                ids: vec![game.platform_id()],
                ..Default::default()
            })
            .await?
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
                installer.mark_game_installed(game.id).await;
                return Ok(());
            }
            _ => {
                tracing::error!("No third party platform found for game: {:?}", game);
                return Err(crate::error::Error::ThirdPartyNotFound);
            }
        }
    }

    let installation = GameInstallationProgress {
        game_id: game.id,
        files: files
            .iter()
            .map(|f| FileInstallationProgress {
                file_id: f.id,
                bytes_read: 0,
                total_size: f.byte_size as usize,
            })
            .collect(),
    };

    installer.mark_game_installing(installation).await;
    let client = reqwest::Client::new();

    for file in files {
        let game = game.clone();
        let app_handle = app_handle.clone();
        let output_directory = output_directory.clone();
        let client = client.clone();

        tauri::async_runtime::spawn(async move {
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

            info!("Downloading file: {:?}", res);

            let game_path = PathBuf::from(&game.path);
            let prefix = match game.storage_type() {
                StorageType::MultiFileGame => game_path.clone(),
                StorageType::SingleFileGame => game_path.clone().parent().unwrap().to_path_buf(),
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

            let installer = app_handle.installer();
            let mut outfile = tokio::fs::File::create(absolute_file).await?;
            let mut stream = res.bytes_stream();

            loop {
                let chunk = stream.try_next().await;
                let bytes = match chunk {
                    Ok(Some(bytes)) => bytes,
                    Ok(None) => break,
                    Err(e) => return Err(crate::Error::from(e)),
                };

                if bytes.is_empty() {
                    break;
                }

                outfile.write_all(&bytes).await?;
                installer
                    .update_installation_progress(game.id, file.id, bytes.len())
                    .await;
            }

            installer.mark_file_installed(game.id, file.id).await;

            Ok(())
        });
    }

    Ok(())
}

#[instrument(skip_all)]
#[tauri::command]
pub async fn uninstall_game<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: Vec<u8>,
) -> crate::Result<()> {
    let payload = UninstallGamePayload::decode(payload.as_slice())?;
    let game = payload.game.unwrap();

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
            app_handle.installer().mark_game_uninstalled(game.id).await;
            return Ok(());
        }
    }

    let installer = app_handle.installer();
    let install_dir = installer.get_installation_dir().await?;
    let output_directory = install_dir.join(game.id.to_string());

    if output_directory.try_exists()? {
        tokio::fs::remove_dir_all(&output_directory).await?;
    }

    installer.mark_game_uninstalled(game.id).await;

    Ok(())
}

#[instrument(skip(app_handle))]
#[tauri::command]
pub async fn get_game_installation_status<R: Runtime>(
    app_handle: AppHandle<R>,
    game_id: i32,
) -> i32 {
    let installer = app_handle.installer();
    installer.get_game_installation_status(game_id).await.into()
}

#[instrument(skip(app_handle))]
#[tauri::command]
pub async fn get_installation_state<R: Runtime>(
    app_handle: AppHandle<R>,
) -> crate::Result<Vec<u8>> {
    let installer = app_handle.installer();
    let mut installation_state: HashMap<i32, i32> = HashMap::new();

    for game_id in installer.installed_games.read().await.iter() {
        installation_state.insert(*game_id, InstallationStatus::Installed.into());
    }

    for game_id in installer.currently_installing.read().await.keys() {
        installation_state.insert(*game_id, InstallationStatus::Installing.into());
    }

    let res = InstallationState { installation_state };

    Ok(res.encode_to_vec())
}

#[instrument(skip(app_handle))]
#[tauri::command]
pub async fn update_steam_installations<R: Runtime>(app_handle: AppHandle<R>) -> crate::Result<()> {
    let installer = app_handle.installer();

    installer.update_steam_installations().await
}

#[instrument(skip(app))]
#[tauri::command]
pub async fn open_installation_dir<R: Runtime>(
    app: AppHandle<R>,
    game_id: Option<i32>,
) -> crate::Result<()> {
    let mut path = app.installer().get_installation_dir().await?;

    if let Some(game_id) = game_id {
        let game_path = path.join(game_id.to_string());
        if game_path.is_dir() {
            path = game_path;
        }
    }

    app.opener()
        .open_path(path.to_string_lossy(), None::<&str>)?;

    Ok(())
}

#[instrument(skip(app))]
#[tauri::command]
pub async fn migrate_installation_dir<R: Runtime>(
    app: AppHandle<R>,
    new_dir: &str,
) -> crate::Result<()> {
    let new_dir = PathBuf::from(new_dir);
    let installer = app.installer();
    let old_dir = installer.get_installation_dir().await?;
    let installing = installer.currently_installing.read().await;

    if !installing.is_empty() {
        return Err(crate::error::Error::MigrationError(
            "Currently installing at least one game".into(),
        ));
    }

    if !new_dir.exists() {
        tokio::fs::create_dir_all(&new_dir).await?;
    }

    let installed_games = installer.installed_games.read().await;

    for game_id in installed_games.iter() {
        let path = old_dir.join(game_id.to_string());
        let new_path = new_dir.join(path.file_name().unwrap());

        if path.exists() {
            tokio::fs::rename(&path, &new_path).await?;
        } else {
            tracing::debug!(
                "Game directory for game ID {} does not exist at the old path: {:?}",
                game_id,
                path
            );
        }
    }

    Ok(())
}

#[instrument(skip(app))]
#[tauri::command]
pub async fn clear_installation_dir<R: Runtime>(app: AppHandle<R>) -> crate::Result<()> {
    let installer = app.installer();
    let install_dir = installer.get_installation_dir().await?;
    let mut entries = tokio::fs::read_dir(&install_dir).await?;

    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        if path.is_dir() {
            tokio::fs::remove_dir_all(&path).await?;
        } else {
            tokio::fs::remove_file(&path).await?;
        }
    }

    installer.installed_games.write().await.clear();
    installer.init_installation_index().await?;

    Ok(())
}
