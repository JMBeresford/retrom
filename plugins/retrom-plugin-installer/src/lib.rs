use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod desktop;

mod commands;
mod error;

pub use error::{Error, Result};

use desktop::Installer;
use tracing::{info_span, Instrument};

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the installer APIs.
pub trait InstallerExt<R: Runtime> {
    fn installer(&self) -> &Installer<R>;
}

impl<R: Runtime, T: Manager<R>> crate::InstallerExt<R> for T {
    fn installer(&self) -> &Installer<R> {
        self.state::<Installer<R>>().inner()
    }
}

/// Initializes the plugin.
#[tracing::instrument]
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::<R>::new("installer")
        .invoke_handler(tauri::generate_handler![
            commands::install_game,
            commands::uninstall_game,
            commands::get_installation_status,
            commands::subscribe_to_installation_index,
            commands::subscribe_to_installation_updates,
            commands::unsubscribe_from_installation_index,
            commands::unsubscribe_from_installation_updates,
            commands::open_installation_dir,
            commands::migrate_installation_dir,
            commands::clear_installation_dir,
            commands::update_steam_installations
        ])
        .setup(|app, api| {
            let installer = desktop::init(app, api)?;
            app.manage(installer);

            let app = app.clone();
            let (tx, rx) = std::sync::mpsc::channel::<crate::Result<()>>();

            tauri::async_runtime::spawn_blocking(|| {
                tauri::async_runtime::block_on(
                    async move {
                        let installer = app.installer();
                        let res = installer.init_installation_index().await;

                        tx.send(res).unwrap();
                    }
                    .instrument(info_span!("installer_setup")),
                )
            });

            if let Err(why) = rx.recv().expect("Failed to receive from channel") {
                tracing::error!("Failed to initialize installer: {:#?}", why);
            }

            Ok(())
        })
        .build()
}
