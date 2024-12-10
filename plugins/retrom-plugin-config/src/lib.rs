use config_manager::ConfigManager;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod commands;
mod config_manager;
mod error;

pub use error::{Error, Result};

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the config APIs.
pub trait ConfigExt<R: Runtime> {
    fn config_manager(&self) -> &ConfigManager<R>;
}

impl<R: Runtime, T: Manager<R>> crate::ConfigExt<R> for T {
    fn config_manager(&self) -> &ConfigManager<R> {
        self.state::<ConfigManager<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("config")
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::set_config
        ])
        .setup(|app, api| {
            let config_manager = config_manager::init(app, api)?;
            app.manage(config_manager);
            Ok(())
        })
        .build()
}
