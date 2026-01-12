use desktop::RetromPluginServiceClient;
pub use error::{Error, Result};
use hyper::Uri;
use hyper_rustls::HttpsConnector;
use hyper_util::client::legacy::{connect::HttpConnector, Client};
use retrom_codegen::retrom::{
    emulator_service_client::EmulatorServiceClient, game_service_client::GameServiceClient,
    metadata_service_client::MetadataServiceClient, platform_service_client::PlatformServiceClient,
    services::saves::v2::emulator_saves_service_client::EmulatorSavesServiceClient,
};
use std::str::FromStr;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use tonic::body::Body;
use tonic_web::{GrpcWebCall, GrpcWebClientService};

mod commands;
mod desktop;
mod error;

type GrpcWebClient = GrpcWebClientService<Client<HttpsConnector<HttpConnector>, GrpcWebCall<Body>>>;

type MetadataClient = MetadataServiceClient<GrpcWebClient>;
type GameClient = GameServiceClient<GrpcWebClient>;
type EmulatorClient = EmulatorServiceClient<GrpcWebClient>;
type PlatformClient = PlatformServiceClient<GrpcWebClient>;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the retrom-plugin-service-client APIs.
pub trait RetromPluginServiceClientExt<R: Runtime> {
    fn service_client(&self) -> &RetromPluginServiceClient<R>;
    fn get_metadata_client(&self) -> impl std::future::Future<Output = MetadataClient>;
    fn get_game_client(&self) -> impl std::future::Future<Output = GameClient>;
    fn get_emulator_client(&self) -> impl std::future::Future<Output = EmulatorClient>;
    fn get_platform_client(&self) -> impl std::future::Future<Output = PlatformClient>;
    fn get_emulator_saves_client(
        &self,
    ) -> impl std::future::Future<Output = EmulatorSavesServiceClient<GrpcWebClient>>;
}

impl<R: Runtime, T: Manager<R>> crate::RetromPluginServiceClientExt<R> for T {
    fn service_client(&self) -> &RetromPluginServiceClient<R> {
        self.state::<RetromPluginServiceClient<R>>().inner()
    }

    async fn get_platform_client(&self) -> PlatformClient {
        let state = self.service_client();
        let host = state.get_service_host().await;

        let uri = Uri::from_str(&host).expect("Could not parse URI");
        let grpc_web_client = state.get_grpc_web_client();

        PlatformServiceClient::with_origin(grpc_web_client, uri)
    }

    async fn get_emulator_client(&self) -> EmulatorClient {
        let state = self.service_client();
        let host = state.get_service_host().await;

        let uri = Uri::from_str(&host).expect("Could not parse URI");
        let grpc_web_client = state.get_grpc_web_client();

        EmulatorServiceClient::with_origin(grpc_web_client, uri)
    }

    async fn get_game_client(&self) -> GameClient {
        let state = self.service_client();
        let host = state.get_service_host().await;

        let uri = Uri::from_str(&host).expect("Could not parse URI");
        let grpc_web_client = state.get_grpc_web_client();

        GameServiceClient::with_origin(grpc_web_client, uri)
    }

    async fn get_metadata_client(&self) -> MetadataClient {
        let state = self.service_client();
        let host = state.get_service_host().await;

        let uri = Uri::from_str(&host).expect("Could not parse URI");
        let grpc_web_client = state.get_grpc_web_client();

        MetadataServiceClient::with_origin(grpc_web_client, uri)
    }

    async fn get_emulator_saves_client(&self) -> EmulatorSavesServiceClient<GrpcWebClient> {
        let state = self.service_client();
        let host = state.get_service_host().await;

        let uri = Uri::from_str(&host).expect("Could not parse URI");
        let grpc_web_client = state.get_grpc_web_client();

        EmulatorSavesServiceClient::with_origin(grpc_web_client, uri)
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("retrom-plugin-service-client")
        .invoke_handler(tauri::generate_handler![])
        .setup(|app, api| {
            let retrom_plugin_service_client = desktop::init(app, api)?;
            app.manage(retrom_plugin_service_client);
            Ok(())
        })
        .build()
}
