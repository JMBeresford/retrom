pub type DbPool = sqlx::AnyPool;

#[cfg(feature = "embedded")]
pub mod embedded;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Error running migrations: {0}")]
    MigrationError(String),

    #[error("Error connecting to database: {0}")]
    ConnectionError(String),

    #[cfg(feature = "embedded")]
    #[error("Embedded DB error")]
    EmbeddedError(#[from] postgresql_embedded::Error),

    #[error("Could not create embedded database")]
    NotExists,

    #[error(transparent)]
    IOError(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

/// Install the default sqlx drivers and open a connection pool for the given URL.
///
/// The driver is selected at runtime from the URL scheme:
/// - `postgres://` or `postgresql://` → PostgreSQL
/// - `sqlite://` → SQLite
pub async fn connect(url: &str) -> Result<DbPool> {
    sqlx::any::install_default_drivers();

    sqlx::AnyPool::connect(url)
        .await
        .map_err(|e| Error::ConnectionError(e.to_string()))
}

/// Run all pending migrations against the given pool.
pub async fn run_migrations(pool: &DbPool) -> Result<()> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .map_err(|e| Error::MigrationError(e.to_string()))
}
