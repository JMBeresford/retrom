use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use retrom_service_common::{
    media_cache::MediaCache,
    metadata_providers::{igdb::provider::IGDBProvider, steam::provider::SteamWebApiProvider},
};
use retrom_service_config::config::ServerConfigManager;
use retrom_service_library::job_manager::JobManager;
use retrom_service_metadata::metadata_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit, sync::Arc};

const DEFAULT_PORT: u16 = 5110;
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

    init_tracing_subscriber(telemetry_enabled, "retrom-service-metadata.log").await;

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

    let config_manager = Arc::new(config_manager);
    let igdb_client = Arc::new(IGDBProvider::new(config_manager.clone()));
    let steam_web_api_client = Arc::new(SteamWebApiProvider::new(config_manager.clone()));
    let media_cache = Arc::new(MediaCache::new(config_manager.clone()));
    let job_manager = Arc::new(JobManager::new());

    let addr: SocketAddr = format!("0.0.0.0:{DEFAULT_PORT}").parse().unwrap();

    let router = metadata_router(
        pool,
        igdb_client,
        steam_web_api_client,
        media_cache,
        job_manager,
        config_manager,
    )
    .layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Metadata service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
