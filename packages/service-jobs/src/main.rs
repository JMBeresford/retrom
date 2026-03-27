use retrom_service_jobs::jobs_router;
use retrom_telemetry::init_tracing_subscriber;
use std::net::SocketAddr;

const DEFAULT_PORT: u16 = 5107;

#[tokio::main]
async fn main() {
    init_tracing_subscriber(false, "retrom-service-jobs.log").await;

    let addr: SocketAddr = format!("0.0.0.0:{DEFAULT_PORT}").parse().unwrap();

    let router = jobs_router().layer(tonic_web::GrpcWebLayer::new());

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("Jobs service listening on {}", addr);

    if let Err(why) = axum::serve(listener, router).await {
        tracing::error!("Server error: {}", why);
    }
}
