use retrom_codegen::retrom::services::config::v1::GetServerConfigRequest;
use retrom_service_common::{
    grpc_clients::config_svc::get_config_svc_client, reflection::reflection_router,
    svc_definitions::JOB_SVC_PORT,
};
use retrom_service_jobs::router::jobs_router;
use retrom_telemetry::init_tracing_subscriber;
use std::{net::SocketAddr, process::exit};

#[tokio::main]
async fn main() {
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

    let telemetry_enabled = config.telemetry.is_some_and(|t| t.enabled);

    init_tracing_subscriber(telemetry_enabled, "retrom-service-jobs.log").await;

    let port = config
        .connection
        .as_ref()
        .and_then(|conn| conn.port)
        .map(|p| p as u16)
        .unwrap_or(JOB_SVC_PORT);

    let addr: SocketAddr = format!("0.0.0.0:{port}").parse().unwrap();

    let router = jobs_router()
        .layer(tonic_web::GrpcWebLayer::new())
        .merge(reflection_router());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Jobs service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
