use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,".into())
                .add_directive("tokio_postgres=info".parse().unwrap())
                .add_directive("hyper=info".parse().unwrap()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    #[cfg(feature = "embedded_db")]
    let db_opts = std::env::var("EMBEDDED_DB_OPTS").ok();
    #[cfg(feature = "embedded_db")]
    let opts: Option<&str> = db_opts.as_deref();

    #[cfg(not(feature = "embedded_db"))]
    let opts = None;

    let (server, _port) = retrom_service::get_server(opts).await;
    let _ = server.await;

    Ok(())
}
