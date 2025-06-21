use retrom_service::get_server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
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
