use retrom_codegen::retrom::services::config::v1::{GetServerConfigRequest, ServerConfig};
use retrom_service::get_server;
use retrom_service_common::grpc_clients::config_svc::get_config_svc_client;
use retrom_service_config::router::config_router;
use retrom_telemetry::init_tracing_subscriber;
use tokio::net::TcpListener;

#[tokio::main]
#[tracing::instrument]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut telemetry_enabled = false;

    if let Some(config) = get_config_from_oneshot_config_svc().await {
        telemetry_enabled = config.telemetry.map(|t| t.enabled).unwrap_or(false);
    };

    std::env::set_var("SERVICE_NAME", env!("CARGO_PKG_NAME"));
    std::env::set_var("SERVICE_VERSION", env!("CARGO_PKG_VERSION"));

    println!("Telemetry enabled: {}", telemetry_enabled);
    init_tracing_subscriber(telemetry_enabled, "./retrom.log").await;

    if cfg!(debug_assertions) {
        dotenvy::dotenv().ok();
    }

    let (server, _port) = get_server().await;

    let _ = server.await;

    Ok(())
}

async fn get_config_from_oneshot_config_svc() -> Option<ServerConfig> {
    let router = config_router(None);
    let (tx, rx) = tokio::sync::oneshot::channel::<()>();

    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("Failed to bind to address");

    let port = listener
        .local_addr()
        .expect("Failed to get local address")
        .port();

    tokio::spawn(async move {
        axum::serve(listener, router)
            .with_graceful_shutdown(async {
                rx.await.ok();
            })
            .await
            .expect("Failed to start config service");
    });

    let mut client = get_config_svc_client(Some(port));

    let config = match client.get_server_config(GetServerConfigRequest {}).await {
        Ok(r) => r.into_inner().config,
        Err(err) => {
            tracing::warn!("Failed to fetch server config from oneshot config service: {err}");
            None
        }
    };

    tx.send(()).ok();

    config
}
