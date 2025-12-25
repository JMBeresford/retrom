use retrom_telemetry::init_tracing_subscriber;
use retrom_webdav_service::webdav_service;
use std::net::SocketAddr;
use tracing::instrument;

#[instrument]
#[tokio::main]
async fn main() {
    init_tracing_subscriber(true, "retrom-webdav.log").await;
    let addr: SocketAddr = ([127, 0, 0, 1], 5918).into();

    let service = webdav_service(None);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("WebDAV service listening on {}", addr);

    if let Err(why) = axum::serve(listener, service).await {
        tracing::error!("Server error: {}", why);
    }
}
