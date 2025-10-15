use retrom_service::get_server;
use retrom_telemetry::init_tracing_subscriber;

#[tokio::main]
#[tracing::instrument]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut telemetry_enabled = false;
    let server_config = retrom_service_common::config::ServerConfigManager::new();

    if let Ok(config) = server_config {
        if config
            .get_config()
            .await
            .telemetry
            .is_some_and(|t| t.enabled)
        {
            telemetry_enabled = true;
        }
    };

    std::env::set_var("SERVICE_NAME", env!("CARGO_PKG_NAME"));
    std::env::set_var("SERVICE_VERSION", env!("CARGO_PKG_VERSION"));

    println!("Telemetry enabled: {}", telemetry_enabled);
    init_tracing_subscriber(telemetry_enabled, "./retrom.log").await;

    if cfg!(debug_assertions) {
        dotenvy::dotenv().ok();
    }

    #[cfg(not(feature = "embedded_db"))]
    let opts = None;

    #[cfg(feature = "embedded_db")]
    let db_opts = std::env::var("EMBEDDED_DB_OPTS").ok();
    #[cfg(feature = "embedded_db")]
    let opts: Option<&str> = db_opts.as_deref();

    let (server, _port) = get_server(opts).await;

    let _ = server.await;

    Ok(())
}
