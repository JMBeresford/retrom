use crate::Result;
use crate::SaveManagerExt;
use prost::Message;
use retrom_codegen::retrom::client::saves::{
    SaveSyncStatus, SyncBehavior, SyncEmulatorSavesPayload,
};
use tauri::{command, AppHandle, Runtime};
use tracing::instrument;

#[command]
#[instrument(skip(app))]
pub(crate) async fn get_emulator_saves_sync_status<R: Runtime>(
    app: AppHandle<R>,
    emulator_id: i32,
) -> Result<i32> {
    let save_manager = app.save_manager();

    let result = save_manager.check_save_sync_status(emulator_id).await?;

    Ok(result.status)
}

#[command]
#[instrument(skip(app))]
pub(crate) async fn sync_emulator_saves<R: Runtime>(
    app: AppHandle<R>,
    payload: Vec<u8>,
) -> Result<Vec<u8>> {
    let payload = SyncEmulatorSavesPayload::decode(payload.as_slice())?;
    let emulator_id = payload.emulator_id;
    let behavior = payload.behavior();

    let save_manager = app.save_manager();

    let result = save_manager.check_save_sync_status(emulator_id).await?;
    match result.status() {
        SaveSyncStatus::LocalNewer => {
            save_manager.upload_local_save_files(emulator_id).await?;
        }
        SaveSyncStatus::CloudNewer => {
            save_manager.download_cloud_save_files(emulator_id).await?;
        }
        SaveSyncStatus::LocalError => match behavior {
            SyncBehavior::ForceCloud => {
                save_manager.download_cloud_save_files(emulator_id).await?;
            }
            SyncBehavior::ForceLocal => {
                save_manager.upload_local_save_files(emulator_id).await?;
            }
            // Respond with LocalError to indicate failure, and allow caller to retry with a
            // different behavior.
            _ => {}
        },
        _ => {}
    };

    let bytes = result.encode_to_vec();

    Ok(bytes)
}
