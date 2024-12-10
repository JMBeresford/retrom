mod commands;
mod desktop;
mod error;

use desktop::Standalone;
pub use error::{Error, Result};
use retrom_plugin_config::ConfigExt;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use tokio::runtime::Handle;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the standalone APIs.
pub trait StandaloneExt<R: Runtime> {
    fn standalone(&self) -> &Standalone<R>;
}

impl<R: Runtime, T: Manager<R>> crate::StandaloneExt<R> for T {
    fn standalone(&self) -> &Standalone<R> {
        self.state::<Standalone<R>>().inner()
    }
}

/// Initializes the plugin.
/// [TODO:description]
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("standalone")
        .invoke_handler(tauri::generate_handler![
            commands::enable_standalone_mode,
            commands::disable_standalone_mode
        ])
        .setup(|app, api| {
            let standalone = desktop::init(app, api)?;
            app.manage(standalone);

            let app = app.clone();
            tokio::spawn(async move {
                let standalone = app.standalone();

                let client_config = app.config_manager().get_config().await;

                let is_standalone = client_config.config.is_some_and(|c| c.standalone);
                if is_standalone {
                    if let Err(why) = standalone.start_server().await {
                        tracing::error!("Failed to start standalone server: {}", why);
                    }
                }
            });

            Ok(())
        })
        .on_event(|app, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                tokio::task::block_in_place(move || {
                    Handle::current().block_on(async move {
                        let standalone = app.standalone();
                        if let Err(why) = standalone.stop_server().await {
                            tracing::error!("Failed to stop standalone server: {}", why);
                        }
                    });
                });
            }
        })
        .build()
}
