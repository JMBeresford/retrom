use retrom_service_config::config::ServerConfigManager;
use retrom_service_files::files_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit};

const DEFAULT_PORT: u16 = 5108;

#[tokio::main]
async fn main() {
    if cfg!(debug_assertions) {
        dotenvy::dotenv().ok();
    }

    let config_manager = match ServerConfigManager::new() {
        Ok(config) => config,
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

    init_tracing_subscriber(telemetry_enabled, "retrom-service-files.log").await;

    let addr: SocketAddr = format!("0.0.0.0:{DEFAULT_PORT}").parse().unwrap();

    let router = files_router().layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Files service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
