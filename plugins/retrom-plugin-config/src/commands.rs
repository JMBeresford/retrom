use crate::ConfigExt;
use crate::Result;
use prost::Message;
use retrom_codegen::retrom::RetromClientConfig;
use tauri::{command, AppHandle, Runtime};

#[command]
pub(crate) async fn get_config<R: Runtime>(app: AppHandle<R>) -> Result<Vec<u8>> {
    let config = app.config_manager().get_config().await;
    tracing::debug!("Getting config: {:?}", config);

    Ok(config.encode_to_vec())
}

#[command]
pub(crate) async fn set_config<R: Runtime>(app: AppHandle<R>, new_config: Vec<u8>) -> Result<()> {
    let new_config = RetromClientConfig::decode(new_config.as_slice())?;

    tracing::debug!("Updating config: {:?}", new_config);

    app.config_manager().update_config(new_config).await
}

#[command]
pub(crate) async fn is_flatpak<R: Runtime>(_app: AppHandle<R>) -> bool {
    cfg!(feature = "flatpak")
}
