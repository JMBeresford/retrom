use std::{collections::HashMap, path::PathBuf, sync::Mutex};

use futures::TryStreamExt;
use reqwest::header::ACCESS_CONTROL_ALLOW_ORIGIN;
use retrom_codegen::retrom::{
    InstallGamePayload, InstallationState, RetromClientConfig, StorageType, UninstallGamePayload,
};
use tauri::{AppHandle, Manager, Runtime};
use tokio::io::AsyncWriteExt;
use tracing::{info, instrument};

use crate::{
    desktop::{FileInstallationProgress, GameInstallationProgress},
    InstallerExt,
};

#[instrument(skip_all, fields(game_id = payload.clone().game.unwrap().id))]
#[tauri::command]
pub async fn install_game<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: InstallGamePayload,
) -> crate::Result<()> {
    let game = payload.game.unwrap();
    let files = payload.files;
    let installer = app_handle.installer();

    let install_dir = installer.installation_directory.read().await;
    let output_directory = install_dir.join(game.id.to_string());

    if !(output_directory.try_exists()?) {
        std::fs::create_dir_all(&output_directory)?;
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
            let config = app_handle.try_state::<Mutex<RetromClientConfig>>();

            let host: String = match config.and_then(|config| {
                config.lock().ok().and_then(|config| {
                    config.server.as_ref().map(|server| {
                        let mut host = server.hostname.to_string();

                        if let Some(port) = server.port {
                            host.push_str(&format!(":{}", port));
                        }

                        host
                    })
                })
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

#[instrument(skip_all, fields(game_id = payload.clone().game.unwrap().id))]
#[tauri::command]
pub async fn uninstall_game<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: UninstallGamePayload,
) -> crate::Result<()> {
    let game = payload.game.unwrap();
    let installer = app_handle.installer();
    let install_dir = installer.installation_directory.read().await;
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
pub async fn get_installation_state<R: Runtime>(app_handle: AppHandle<R>) -> InstallationState {
    let installer = app_handle.installer();
    let mut installation_state: HashMap<i32, i32> = HashMap::new();

    let mut ids = Vec::new();

    installer
        .currently_installing
        .read()
        .await
        .iter()
        .for_each(|(id, _)| {
            ids.push(*id);
        });

    installer
        .installed_games
        .read()
        .await
        .iter()
        .for_each(|id| {
            if !ids.contains(id) {
                ids.push(*id);
            }
        });

    for game_id in ids.iter() {
        let status = installer.get_game_installation_status(*game_id).await;

        installation_state.insert(*game_id, status.into());
    }

    InstallationState { installation_state }
}
