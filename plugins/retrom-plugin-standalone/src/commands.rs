use tauri::{command, AppHandle, Runtime};

use crate::Result;
use crate::StandaloneExt;

#[command]
pub(crate) async fn enable_standalone_mode<R: Runtime>(app: AppHandle<R>) -> Result<u16> {
    if !app.standalone().is_server_running().await {
        app.standalone().start_server().await?;
    }

    let addr = app
        .standalone()
        .get_server_addr()
        .await
        .expect("Could not get local server address");

    Ok(addr.port())
}

#[command]
pub(crate) async fn disable_standalone_mode<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.standalone().stop_server().await
}
