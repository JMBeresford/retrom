use crate::GrpcWebClient;
use hyper_util::rt::TokioExecutor;
use retrom_plugin_config::ConfigExt;
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use tokio_rustls::rustls::{crypto, ClientConfig, RootCertStore};
use tonic_web::GrpcWebClientLayer;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<RetromPluginServiceClient<R>> {
    Ok(RetromPluginServiceClient::new(app.clone()))
}

/// Access to the retrom-plugin-service-client APIs.
pub struct RetromPluginServiceClient<R: Runtime> {
    app_handle: AppHandle<R>,
}

impl<R: Runtime> RetromPluginServiceClient<R> {
    pub fn new(app_handle: AppHandle<R>) -> Self {
        Self { app_handle }
    }

    pub fn get_grpc_web_client(&self) -> GrpcWebClient {
        if crypto::CryptoProvider::get_default().is_none() {
            crypto::aws_lc_rs::default_provider()
                .install_default()
                .expect("Failed to install default crypto provider");
        }

        let roots = RootCertStore {
            roots: webpki_roots::TLS_SERVER_ROOTS.to_vec(),
        };

        let tls = ClientConfig::builder()
            .with_root_certificates(roots)
            .with_no_client_auth();

        let mut http = hyper_util::client::legacy::connect::HttpConnector::new();
        http.enforce_http(false);

        let connector = tower::ServiceBuilder::new()
            .layer_fn(move |s| {
                let tls = tls.clone();

                hyper_rustls::HttpsConnectorBuilder::new()
                    .with_tls_config(tls)
                    .https_or_http()
                    .enable_http2()
                    .wrap_connector(s)
            })
            .service(http);

        let client =
            hyper_util::client::legacy::Client::builder(TokioExecutor::new()).build(connector);

        tower::ServiceBuilder::new()
            .layer(GrpcWebClientLayer::new())
            .service(client)
    }

    pub async fn get_service_host(&self) -> String {
        let client_config = self.app_handle.config_manager().get_config().await;

        let host: String = match client_config.server.map(|server| {
            let mut host = server.hostname.to_string();

            if let Some(port) = server.port {
                host.push_str(&format!(":{port}"));
            }

            host
        }) {
            Some(host) => host,
            None => {
                tracing::warn!("No server configuration found");
                "http://localhost:5101".to_string()
            }
        };

        host
    }
}
