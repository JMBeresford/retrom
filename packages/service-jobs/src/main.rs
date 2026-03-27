use retrom_service_config::config::ServerConfigManager;
use retrom_service_jobs::jobs_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit};

const DEFAULT_PORT: u16 = 5107;

#[tokio::main]
async fn main() {
    let config_manager = match ServerConfigManager::new() {
        Ok(config) => config,
        Err(err) => {
            eprintln!("Could not load configuration: {err:#?}");
            exit(1);
        }
    };

    let config = config_manager.get_config().await;

    let telemetry_enabled = config.telemetry.is_some_and(|t| t.enabled);

    init_tracing_subscriber(telemetry_enabled, "retrom-service-jobs.log").await;

    let port = config
        .connection
        .as_ref()
        .and_then(|conn| conn.port)
        .map(|p| p as u16)
        .unwrap_or(DEFAULT_PORT);

    let addr: SocketAddr = format!("0.0.0.0:{port}").parse().unwrap();

    let router = jobs_router().layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Jobs service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
