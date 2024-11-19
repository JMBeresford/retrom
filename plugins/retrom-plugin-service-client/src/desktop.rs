use crate::GrpcWebClient;
use retrom_codegen::retrom::RetromClientConfig;
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Manager, Runtime};
use tokio_rustls::rustls::{ClientConfig, RootCertStore};
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

        tower::ServiceBuilder::new()
            .layer(GrpcWebClientLayer::new())
            .service(client)
    }

    pub async fn get_service_host(&self) -> String {
        let config = self
            .app_handle
            .try_state::<std::sync::Mutex<RetromClientConfig>>();
        let host: String = match config.and_then(|config| {
            config.lock().ok().and_then(|config| {
                config.server.as_ref().map(|server| {
                    let mut host = server.hostname.to_string();

                    if let Some(port) = server.port {
                        host.push_str(&format!(":{}", port));
                    }

                    tracing::info!("Server host: {}", host);

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
}
