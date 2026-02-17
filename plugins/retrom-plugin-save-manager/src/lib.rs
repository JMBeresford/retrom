use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod commands;
#[cfg(desktop)]
mod desktop;
mod error;
mod snapshot;

pub use error::{Result, SaveManagerError};

#[cfg(desktop)]
use desktop::SaveManager;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the save-manager APIs.
pub trait SaveManagerExt<R: Runtime> {
    fn save_manager(&self) -> &SaveManager<R>;
}

impl<R: Runtime, T: Manager<R>> crate::SaveManagerExt<R> for T {
    fn save_manager(&self) -> &SaveManager<R> {
        self.state::<SaveManager<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("save-manager")
        .invoke_handler(tauri::generate_handler![
            commands::get_emulator_saves_sync_status,
            commands::sync_emulator_saves
        ])
        .setup(|app, api| {
            #[cfg(desktop)]
            let save_manager = desktop::init(app, api)?;

            app.manage(save_manager);
            Ok(())
        })
        .build()
}
