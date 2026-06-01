use retrom_codegen::descriptors::retrom::FILE_DESCRIPTOR_SET;
use retrom_service_config::config::ServerConfigManager;
use retrom_service_library::library_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit};

const DEFAULT_PORT: u16 = 5109;
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

    let telemetry_enabled = config_manager
        .get_config()
        .await
        .telemetry
        .is_some_and(|t| t.enabled);

    init_tracing_subscriber(telemetry_enabled, "retrom-service-library.log").await;

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

    retrom_db::run_migrations(&pool, &db_url)
        .await
        .unwrap_or_else(|err| {
            eprintln!("Failed to run database migrations: {err:#?}");
            exit(1);
        });

    let addr: SocketAddr = format!("0.0.0.0:{DEFAULT_PORT}").parse().unwrap();

    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build_v1()
        .unwrap();

    let reflection_service_alpha = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build_v1alpha()
        .unwrap();

    let mut reflection_route_builder = tonic::service::Routes::builder();
    reflection_route_builder
        .add_service(reflection_service)
        .add_service(reflection_service_alpha);

    let reflection_router = reflection_route_builder.routes();

    let router = library_router(pool)
        .layer(tonic_web::GrpcWebLayer::new())
        .merge(reflection_router.into_axum_router().reset_fallback());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Library service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
