use retrom_service_common::config::ServerConfigManager;
use retrom_service_config::config_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit, sync::Arc};

const DEFAULT_PORT: u16 = 5103;

#[tokio::main]
async fn main() {
    let config_manager = match ServerConfigManager::new() {
        Ok(config) => Arc::new(config),
        Err(err) => {
            eprintln!("Could not load configuration: {err:#?}");
            exit(1);
        }
    };

    let telemetry_enabled = config_manager
        .get_config()
        .await
        .telemetry
        .is_some_and(|t| t.enabled);

    init_tracing_subscriber(telemetry_enabled, "retrom-service-config.log").await;

    let addr: SocketAddr = format!("0.0.0.0:{DEFAULT_PORT}").parse().unwrap();

    let router = config_router(config_manager).layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Config service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
