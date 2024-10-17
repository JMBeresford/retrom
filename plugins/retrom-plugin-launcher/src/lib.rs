use std::{str::FromStr, sync::Mutex};

use hyper::{client::HttpConnector, Client, Uri};
use hyper_rustls::HttpsConnector;
use retrom_codegen::retrom::{
    emulator_service_client::EmulatorServiceClient, game_service_client::GameServiceClient,
    metadata_service_client::MetadataServiceClient, RetromClientConfig,
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
use tokio_rustls::rustls::{ClientConfig, RootCertStore};
use tonic::{body::BoxBody, transport::Channel};
use tonic_web::{GrpcWebCall, GrpcWebClientLayer, GrpcWebClientService};
use tracing::info;

type MetadataClient = MetadataServiceClient<
    GrpcWebClientService<Client<HttpsConnector<HttpConnector>, GrpcWebCall<BoxBody>>>,
>;
// type MetadataClient = MetadataServiceClient<Channel>;
type GameClient = GameServiceClient<Channel>;
type EmulatorClient = EmulatorServiceClient<Channel>;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the launcher APIs.
pub trait LauncherExt<R: Runtime> {
    fn launcher(&self) -> &Launcher<R>;
    fn get_service_host(&self) -> impl std::future::Future<Output = String>;
    fn get_metadata_client(&self) -> impl std::future::Future<Output = MetadataClient>;
    fn get_game_client(&self) -> impl std::future::Future<Output = GameClient>;
    fn get_emulator_client(&self) -> impl std::future::Future<Output = EmulatorClient>;
}

impl<R: Runtime, T: Manager<R>> crate::LauncherExt<R> for T {
    fn launcher(&self) -> &Launcher<R> {
        self.try_state::<Launcher<R>>()
            .expect("Could not get launcher from app instance")
            .inner()
    }

    async fn get_service_host(&self) -> String {
        let config = self.app_handle().try_state::<Mutex<RetromClientConfig>>();
        let host: String = match config.and_then(|config| {
            config.lock().ok().and_then(|config| {
                config.server.as_ref().map(|server| {
                    let mut host = server.hostname.to_string();

                    if let Some(port) = server.port {
                        host.push_str(&format!(":{}", port));
                    }

                    info!("Server host: {}", host);

                    host
                })
            })
        }) {
            Some(host) => host,
            None => {
                tracing::warn!("No server configuration found");
                "http://localhost:5101".to_string()
            }
        };

        host
    }

    async fn get_metadata_client(&self) -> MetadataClient {
        let host: String = self.get_service_host().await;

        let uri = Uri::from_str(&host).expect("Failed to parse URI");

        let roots = RootCertStore {
            roots: webpki_roots::TLS_SERVER_ROOTS.to_vec(),
        };

        let tls = ClientConfig::builder()
            .with_root_certificates(roots)
            .with_no_client_auth();

        let https = hyper_rustls::HttpsConnectorBuilder::new()
            .with_tls_config(tls)
            .https_or_http()
            .enable_http2()
            .build();

        let client = hyper::Client::builder().build(https);

        let connector = tower::ServiceBuilder::new()
            .layer(GrpcWebClientLayer::new())
            // .map_request(|_| uri.clone())
            .service(client);

        MetadataServiceClient::with_origin(connector, uri)
    }

    async fn get_game_client(&self) -> GameClient {
        let host = self.get_service_host().await;
        let mut sleep = 100.0;

        loop {
            match GameServiceClient::connect(host.clone()).await {
                Ok(client) => {
                    return client;
                }
                Err(_) => {
                    tracing::warn!("Failed to connect to metadata service, retring");
                    tokio::time::sleep(std::time::Duration::from_millis(sleep as u64)).await;
                    sleep *= 1.2;
                }
            }
        }
    }

    async fn get_emulator_client(&self) -> EmulatorClient {
        let host = self.get_service_host().await;
        let mut sleep = 100.0;

        loop {
            match EmulatorServiceClient::connect(host.clone()).await {
                Ok(client) => {
                    return client;
                }
                Err(_) => {
                    tracing::warn!("Failed to connect to metadata service, retring");
                    tokio::time::sleep(std::time::Duration::from_millis(sleep as u64)).await;
                    sleep *= 1.2;
                }
            }
        }
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
