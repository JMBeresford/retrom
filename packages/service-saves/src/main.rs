use retrom_db::DEFAULT_DB_URL;
use retrom_service_common::{config::ServerConfigManager, svc_definitions::SAVE_SVC_PORT};
use retrom_service_saves::router::saves_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit, sync::Arc};

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

    init_tracing_subscriber(telemetry_enabled, "retrom-service-saves.log").await;

    let db_url = config_manager
        .get_config()
        .await
        .connection
        .and_then(|conn| conn.db_url)
        .unwrap_or_else(|| DEFAULT_DB_URL.to_string());

    let pool = retrom_db::connect(&db_url).await.unwrap_or_else(|err| {
        tracing::error!("Failed to connect to database: {err:#?}");
        exit(1);
    });

    retrom_db::run_migrations(&pool)
        .await
        .unwrap_or_else(|err| {
            tracing::error!("Failed to run database migrations: {err:#?}");
            exit(1);
        });

    let config_manager = Arc::new(config_manager);
    let addr: SocketAddr = format!("0.0.0.0:{SAVE_SVC_PORT}").parse().unwrap();

    let router = saves_router(pool, config_manager).layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Saves service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
