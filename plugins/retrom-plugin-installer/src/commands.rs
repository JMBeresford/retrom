use crate::InstallerExt;
use prost::Message;
use retrom_codegen::retrom::{
    client::installation::{
        GetInstallationStatusPayload, GetInstallationStatusResponse, InstallGamePayload,
        InstallationStatus, UninstallGamePayload,
    },
    GetGamesRequest,
};
use retrom_plugin_service_client::RetromPluginServiceClientExt;
use retrom_plugin_steam::SteamExt;
use std::path::PathBuf;
use tauri::{ipc::Channel, AppHandle, Runtime};
use tauri_plugin_opener::OpenerExt;
use tracing::{debug, instrument};

#[instrument(skip_all)]
#[tauri::command]
pub async fn install_game<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: Vec<u8>,
) -> crate::Result<()> {
    let payload = InstallGamePayload::decode(payload.as_slice())?;
    let installer = app_handle.installer();
    installer.begin_installation(payload).await
}

#[instrument(skip_all)]
#[tauri::command]
pub async fn uninstall_game<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: Vec<u8>,
) -> crate::Result<()> {
    let payload = UninstallGamePayload::decode(payload.as_slice())?;
    let game_id = payload.game_id;

    let mut game_client = app_handle.get_game_client().await;
    let game = game_client
        .get_games(GetGamesRequest {
            ids: vec![game_id],
            ..Default::default()
        })
        .await?
        .into_inner()
        .games
        .into_iter()
        .next()
        .ok_or_else(|| {
            crate::error::Error::InternalError(format!("Game with id {game_id} not found"))
        })?;

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
            app_handle
                .installer()
                .mark_game_uninstalled(game.id)
                .await?;

            return Ok(());
        }
    }

    let installer = app_handle.installer();
    let install_dir = installer.get_installation_dir().await?;
    let output_directory = install_dir.join(game.id.to_string());

    if output_directory.try_exists()? {
        tokio::fs::remove_dir_all(&output_directory).await?;
    }

    installer.mark_game_uninstalled(game.id).await
}

#[instrument(skip_all)]
#[tauri::command]
pub async fn subscribe_to_installation_index<R: Runtime>(
    app_handle: AppHandle<R>,
    channel: Channel<&'static [u8]>,
) -> crate::Result<()> {
    let installer = app_handle.installer();
    debug!("Subscribing to installation index updates");
    let index = installer.get_installation_index().await?;
    if let Err(why) = channel.send(index.encode_to_vec().as_slice()) {
        tracing::error!(
            "Failed to send installation index to new subscriber: {:#?}",
            why
        );
    }

    installer.index_subscriptions.write().await.push(channel);

    Ok(())
}

#[instrument(skip(app_handle))]
#[tauri::command]
pub async fn update_steam_installations<R: Runtime>(app_handle: AppHandle<R>) -> crate::Result<()> {
    let installer = app_handle.installer();

    installer.update_steam_installations().await
}

#[instrument(skip(app_handle))]
#[tauri::command]
pub async fn get_installation_status<R: Runtime>(
    app_handle: AppHandle<R>,
    payload: Vec<u8>,
) -> crate::Result<Vec<u8>> {
    let payload = GetInstallationStatusPayload::decode(payload.as_slice())?;
    let installer = app_handle.installer();

    let status = installer
        .get_game_installation_status(payload.game_id)
        .await;

    Ok(GetInstallationStatusResponse {
        status: status as i32,
        game_id: payload.game_id,
    }
    .encode_to_vec())
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
    let installing = installer.installation_index.read().await.values().any(|i| {
        matches!(
            i.status,
            InstallationStatus::Installing | InstallationStatus::Paused
        )
    });

    if installing {
        return Err(crate::error::Error::MigrationError(
            "Currently installing at least one game".into(),
        ));
    }

    if !new_dir.exists() {
        tokio::fs::create_dir_all(&new_dir).await?;
    }

    let installed_games = installer
        .installation_index
        .read()
        .await
        .iter()
        .filter_map(|(game_id, installation)| {
            if installation.status == InstallationStatus::Installed {
                Some(*game_id)
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

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

    installer.installation_index.write().await.clear();
    installer.init_installation_index().await?;

    Ok(())
}

#[instrument(skip(app, channel))]
#[tauri::command]
pub async fn subscribe_to_installation_updates<R: Runtime>(
    app: AppHandle<R>,
    channel: Channel<&'static [u8]>,
) -> crate::Result<()> {
    let installer = app.installer();
    debug!("Subscribing to installation updates");
    installer.progress_subscriptions.write().await.push(channel);

    Ok(())
}

#[instrument(skip(app))]
#[tauri::command]
pub async fn unsubscribe_from_installation_updates<R: Runtime>(
    app: AppHandle<R>,
    channel_id: u32,
) -> crate::Result<()> {
    let installer = app.installer();
    debug!("Unsubscribing from installation updates");
    installer
        .progress_subscriptions
        .write()
        .await
        .retain(|c| c.id() != channel_id);

    Ok(())
}

#[instrument(skip(app))]
#[tauri::command]
pub async fn unsubscribe_from_installation_index<R: Runtime>(
    app: AppHandle<R>,
    channel_id: u32,
) -> crate::Result<()> {
    let installer = app.installer();
    debug!("Unsubscribing from installation index updates");
    installer
        .index_subscriptions
        .write()
        .await
        .retain(|c| c.id() != channel_id);

    Ok(())
}
