use desktop::Launcher;
pub use error::{Error, Result};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod commands;
mod desktop;
mod error;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the launcher APIs.
pub trait LauncherExt<R: Runtime> {
    fn launcher(&self) -> &Launcher<R>;
}

impl<R: Runtime, T: Manager<R>> crate::LauncherExt<R> for T {
    fn launcher(&self) -> &Launcher<R> {
        self.try_state::<Launcher<R>>()
            .expect("Could not get launcher from app instance")
            .inner()
    }
}

/// Initializes the plugin.
pub async fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("launcher")
        .setup(|app, api| {
            let launcher = desktop::init(app, api)?;
            app.manage(launcher);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::play_game,
            commands::stop_game,
            commands::get_game_play_status,
        ])
        .build()
}
