use futures::TryStreamExt;
use reqwest::header::CONTENT_DISPOSITION;
use retrom_codegen::retrom::{InstallGamePayload, RetromHostInfo, UninstallGamePayload};
use tauri::{AppHandle, Manager, Runtime};
use tokio::io::AsyncWriteExt;
use tracing::instrument;

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
            let host_info = app_handle
                .try_state::<RetromHostInfo>()
                .expect("Host info not found")
                .inner();

            let host = &host_info.host;

            let download_uri = format!("{host}/rest/file/{}", file.id);

            let res = client.get(download_uri).send().await?;
            let filename = res
                .headers()
                .get(CONTENT_DISPOSITION)
                .unwrap()
                .to_str()?
                .split("filename=")
                .last()
                .unwrap_or("unknown");

            let installer = app_handle.installer();
            let mut outfile = tokio::fs::File::create(output_directory.join(filename)).await?;

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
