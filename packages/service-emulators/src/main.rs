use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use retrom_service_config::config::ServerConfigManager;
use retrom_service_emulators::emulators_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit, sync::Arc};

const DEFAULT_PORT: u16 = 5111;
const DEFAULT_DB_URL: &str = "postgres://retrom@localhost/retrom";

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

    let config = config_manager.get_config().await;

    let telemetry_enabled = config.telemetry.as_ref().is_some_and(|t| t.enabled);

    init_tracing_subscriber(telemetry_enabled, "retrom-service-emulators.log").await;

    let db_url = config
        .connection
        .and_then(|conn| conn.db_url)
        .unwrap_or_else(|| DEFAULT_DB_URL.to_string());

    let pool_config = AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(&db_url);

    let pool = Arc::new(
        deadpool::managed::Pool::builder(pool_config)
            .build()
            .expect("Could not create database pool"),
    );

    let addr: SocketAddr = format!("0.0.0.0:{DEFAULT_PORT}").parse().unwrap();

    let router = emulators_router(pool).layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Emulators service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
