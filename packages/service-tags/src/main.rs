use retrom_db::DEFAULT_DB_URL;
use retrom_service_common::{
    config::ServerConfigManager, reflection::reflection_router, svc_definitions::TAG_SVC_PORT,
};
use retrom_service_tags::router::tags_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit};

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

    init_tracing_subscriber(telemetry_enabled, "retrom-service-tags.log").await;

    let db_url = config_manager
        .get_config()
        .await
        .connection
        .and_then(|conn| conn.db_url)
        .unwrap_or_else(|| DEFAULT_DB_URL.to_string());

    let pool = retrom_db::connect(&db_url).await.unwrap_or_else(|err| {
        eprintln!("Failed to connect to database: {err:#?}");
        exit(1);
    });

    retrom_db::run_migrations(&pool)
        .await
        .unwrap_or_else(|err| {
            eprintln!("Failed to run database migrations: {err:#?}");
            exit(1);
        });

    let addr: SocketAddr = format!("0.0.0.0:{TAG_SVC_PORT}").parse().unwrap();

    let router = tags_router(pool)
        .layer(tonic_web::GrpcWebLayer::new())
        .merge(reflection_router());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Tags service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
