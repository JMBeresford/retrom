use retrom_codegen::retrom::RetromClientConfig;
use tauri::{command, AppHandle, Runtime};

use crate::ConfigExt;
use crate::Result;

#[command]
pub(crate) async fn get_config<R: Runtime>(app: AppHandle<R>) -> Result<RetromClientConfig> {
    let config = app.config_manager().get_config().await;
    tracing::debug!("Getting config: {:?}", config);

    Ok(config)
}

#[command]
pub(crate) async fn set_config<R: Runtime>(
    app: AppHandle<R>,
    new_config: RetromClientConfig,
) -> Result<()> {
    tracing::debug!("Updating config: {:?}", new_config);

    app.config_manager().update_config(new_config).await
}
