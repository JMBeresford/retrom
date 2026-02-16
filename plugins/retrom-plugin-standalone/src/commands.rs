use tauri::{command, AppHandle, Runtime};

use crate::Result;
use crate::StandaloneExt;
use local_ip_address::local_ip;

#[command]
pub(crate) async fn enable_standalone_mode<R: Runtime>(app: AppHandle<R>) -> Result<(String, u16)> {
    if cfg!(feature = "flatpak") {
        return Err(crate::Error::FlatpakUnsupported);
    };

    if !app.standalone().is_server_running().await {
        app.standalone().start_server().await?;
    }

    let mut addr = app
        .standalone()
        .get_server_addr()
        .await
        .expect("Could not get local server address");

    if let Ok(local_ip) = local_ip() {
        addr.set_ip(local_ip);
    };

    Ok((addr.ip().to_string(), addr.port()))
}

#[command]
pub(crate) async fn disable_standalone_mode<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.standalone().stop_server().await
}
