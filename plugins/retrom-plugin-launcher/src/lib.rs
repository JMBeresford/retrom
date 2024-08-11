use retrom_codegen::retrom::{
    game_service_client::GameServiceClient, metadata_service_client::MetadataServiceClient,
};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

mod desktop;

mod commands;
mod error;
use desktop::Launcher;
pub use error::{Error, Result};
use tokio::sync::RwLock;
use tonic::transport::Channel;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the launcher APIs.
pub trait LauncherExt<R: Runtime> {
    fn launcher(&self) -> &Launcher<R>;
    fn metadata_client(&self) -> &RwLock<MetadataServiceClient<Channel>>;
    fn game_client(&self) -> &RwLock<GameServiceClient<Channel>>;
}

impl<R: Runtime, T: Manager<R>> crate::LauncherExt<R> for T {
    fn launcher(&self) -> &Launcher<R> {
        self.try_state::<Launcher<R>>()
            .expect("Could not get launcher from app instance")
            .inner()
    }

    fn metadata_client(&self) -> &RwLock<MetadataServiceClient<Channel>> {
        self.try_state::<RwLock<MetadataServiceClient<Channel>>>()
            .expect("Could not get metadata client from app instance")
            .inner()
    }

    fn game_client(&self) -> &RwLock<GameServiceClient<Channel>> {
        self.try_state::<RwLock<GameServiceClient<Channel>>>()
            .expect("Could not get game client from app instance")
            .inner()
    }
}

/// Initializes the plugin.
pub async fn init<R: Runtime>() -> TauriPlugin<R> {
    dotenvy::dotenv().ok();
    let port = std::env::var("RETROM_PORT").unwrap_or_else(|_| "5101".to_string());
    let hostname =
        std::env::var("RETROM_HOSTNAME").unwrap_or_else(|_| "http://localhost".to_string());

    let host = format!("{hostname}:{port}");

    let game_client = GameServiceClient::connect(host.clone())
        .await
        .expect("Failed to connect to game service");

    let metadata_client = MetadataServiceClient::connect(host)
        .await
        .expect("Failed to connect to metadata service");

    Builder::new("launcher")
        .setup(|app, api| {
            app.manage(RwLock::new(metadata_client));
            app.manage(RwLock::new(game_client));

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
