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

type MetadataClient = MetadataServiceClient<Channel>;
type GameClient = GameServiceClient<Channel>;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the launcher APIs.
pub trait LauncherExt<R: Runtime> {
    fn launcher(&self) -> &Launcher<R>;
    fn metadata_client(&self) -> impl std::future::Future<Output = &RwLock<MetadataClient>>;
    fn game_client(&self) -> impl std::future::Future<Output = &RwLock<GameClient>>;
}

impl<R: Runtime, T: Manager<R>> crate::LauncherExt<R> for T {
    fn launcher(&self) -> &Launcher<R> {
        self.try_state::<Launcher<R>>()
            .expect("Could not get launcher from app instance")
            .inner()
    }

    async fn metadata_client(&self) -> &RwLock<MetadataClient> {
        if self.try_state::<RwLock<MetadataClient>>().is_none() {
            dotenvy::dotenv().ok();
            let port = std::env::var("RETROM_PORT").unwrap_or_else(|_| "5101".to_string());
            let hostname =
                std::env::var("RETROM_HOSTNAME").unwrap_or_else(|_| "http://localhost".to_string());

            let host = format!("{hostname}:{port}");
            let mut sleep = 100.0;

            loop {
                match MetadataServiceClient::connect(host.clone()).await {
                    Ok(client) => {
                        self.manage::<RwLock<MetadataClient>>(RwLock::new(client));

                        break;
                    }
                    Err(_) => {
                        tracing::warn!("Failed to connect to metadata service, retring");
                        tokio::time::sleep(std::time::Duration::from_millis(sleep as u64)).await;
                        sleep *= 1.2;
                    }
                }
            }
        }

        self.try_state::<RwLock<MetadataClient>>()
            .expect("Could not get metadata client from app instance")
            .inner()
    }

    async fn game_client(&self) -> &RwLock<GameClient> {
        if self.try_state::<RwLock<GameClient>>().is_none() {
            dotenvy::dotenv().ok();
            let port = std::env::var("RETROM_PORT").unwrap_or_else(|_| "5101".to_string());
            let hostname =
                std::env::var("RETROM_HOSTNAME").unwrap_or_else(|_| "http://localhost".to_string());

            let host = format!("{hostname}:{port}");
            let mut sleep = 100.0;

            loop {
                match GameServiceClient::connect(host.clone()).await {
                    Ok(client) => {
                        self.manage::<RwLock<GameClient>>(RwLock::new(client));

                        break;
                    }
                    Err(_) => {
                        tracing::warn!("Failed to connect to metadata service, retring");
                        tokio::time::sleep(std::time::Duration::from_millis(sleep as u64)).await;
                        sleep *= 1.2;
                    }
                }
            }
        }

        self.try_state::<RwLock<GameClient>>()
            .expect("Could not get game client from app instance")
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
