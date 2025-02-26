use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod desktop;

mod commands;
mod error;

pub use error::{Error, Result};

use desktop::Installer;

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
            commands::get_game_installation_status,
            commands::get_installation_state,
            commands::open_installation_dir,
            commands::migrate_installation_dir,
            commands::clear_installation_dir
        ])
        .setup(|app, api| {
            let installer = desktop::init(app, api)?;
            app.manage(installer);

            let app = app.clone();
            tauri::async_runtime::spawn_blocking(|| {
                tauri::async_runtime::block_on(async move {
                    let installer = app.installer();

                    installer.init_installation_index().await?;

                    crate::Result::Ok(())
                })
            });

            Ok(())
        })
        .build()
}
