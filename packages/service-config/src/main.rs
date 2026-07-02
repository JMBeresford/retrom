use retrom_service_common::{reflection::reflection_router, svc_definitions::CONFIG_SVC_PORT};
use retrom_service_config::router::config_router;
use retrom_telemetry::init_tracing_subscriber;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    init_tracing_subscriber(false, "retrom-service-config.log").await;

    let addr: SocketAddr = format!("0.0.0.0:{CONFIG_SVC_PORT}").parse().unwrap();
    let router = config_router(None)
        .layer(tonic_web::GrpcWebLayer::new())
        .merge(reflection_router());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Config service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
