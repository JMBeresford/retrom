use retrom_codegen::{
    descriptors::retrom::FILE_DESCRIPTOR_SET,
    retrom::services::config::v1::GetServerConfigRequest,
};
use retrom_db::DEFAULT_DB_URL;
use retrom_service_common::{
    grpc_clients::config_svc::get_config_svc_client, svc_definitions::EMULATOR_SVC_PORT,
};
use retrom_service_emulators::router::emulators_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit};

#[tokio::main]
async fn main() {
    if cfg!(debug_assertions) {
        dotenvy::dotenv().ok();
    }

    let mut config_client = get_config_svc_client(None);

    let config = match config_client
        .get_server_config(GetServerConfigRequest {})
        .await
    {
        Ok(response) => response.into_inner().config.unwrap_or_else(|| {
            eprintln!("Server configuration is missing in the response");
            exit(1);
        }),
        Err(err) => {
            eprintln!("Failed to fetch server configuration: {err:#?}");
            exit(1);
        }
    };

    let telemetry_enabled = config.telemetry.as_ref().is_some_and(|t| t.enabled);

    init_tracing_subscriber(telemetry_enabled, "retrom-service-emulators.log").await;

    let db_url = config
        .connection
        .and_then(|conn| conn.db_url)
        .unwrap_or_else(|| DEFAULT_DB_URL.to_string());

    let pool = retrom_db::connect(&db_url).await.unwrap_or_else(|err| {
        tracing::error!("Failed to connect to database: {err}");
        exit(1);
    });

    retrom_db::run_migrations(&pool)
        .await
        .unwrap_or_else(|err| {
            eprintln!("Failed to run database migrations: {err:#?}");
            exit(1);
        });

    let addr: SocketAddr = format!("0.0.0.0:{EMULATOR_SVC_PORT}").parse().unwrap();

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

    let reflection_router = reflection_route_builder
        .routes()
        .into_axum_router()
        .reset_fallback();

    let router = emulators_router(pool)
        .layer(tonic_web::GrpcWebLayer::new())
        .merge(reflection_router);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Emulators service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
