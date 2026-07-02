#[cfg(not(feature = "postgres"))]
pub type RetromDB = sqlx::Sqlite;

#[cfg(feature = "postgres")]
pub type RetromDB = sqlx::Postgres;

#[cfg(not(feature = "postgres"))]
pub const DEFAULT_DB_URL: &str = "sqlite://retrom-dev.db";

#[cfg(feature = "postgres")]
pub const DEFAULT_DB_URL: &str = "postgres://postgres:password@localhost/retrom-dev";

pub type DbPool = sqlx::Pool<RetromDB>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error(transparent)]
    MigrationError(#[from] sqlx::migrate::MigrateError),

    #[error("Error connecting to database: {0}")]
    ConnectionError(String),

    #[error(transparent)]
    IOError(#[from] std::io::Error),

    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

/// Install the default sqlx drivers and open a connection pool for the given URL.
///
/// The driver is selected at runtime from the URL scheme:
/// - `postgres://` or `postgresql://` → PostgreSQL
/// - `sqlite://` → SQLite
pub async fn connect(url: &str) -> Result<DbPool> {
    #[cfg(not(feature = "postgres"))]
    {
        use sqlx::migrate::MigrateDatabase;

        if !sqlx::Sqlite::database_exists(url).await? {
            tracing::info!("Database does not exist at {url}, creating it...");
            sqlx::Sqlite::create_database(url).await?;
        }

        sqlx::sqlite::SqlitePoolOptions::new()
            .connect(url)
            .await
            .map_err(|e| Error::ConnectionError(e.to_string()))
    }

    #[cfg(feature = "postgres")]
    {
        sqlx::postgres::PgPoolOptions::new()
            .connect(url)
            .await
            .map_err(|e| Error::ConnectionError(e.to_string()))
    }
}

/// Run all pending migrations against the given pool.
///
/// `url` is the connection URL used to open `pool`; it is needed to detect
/// whether the target database is SQLite so the bootstrap step can take the
/// correct path.
pub async fn run_migrations(pool: &DbPool) -> Result<()> {
    #[cfg(feature = "postgres")]
    let mut migrations_runner = sqlx::migrate!("./migrations/postgres");

    #[cfg(not(feature = "postgres"))]
    let mut migrations_runner = sqlx::migrate!("./migrations/sqlite");

    let mut tx = pool.begin().await?;

    migrations_runner
        .set_ignore_missing(true)
        .run(&mut *tx)
        .await?;

    Ok(tx.commit().await?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::pool::PoolOptions;

    async fn sqlite_pool(url: &str) -> DbPool {
        sqlx::any::install_default_drivers();
        // max_connections(1) ensures all operations share the same underlying
        // SQLite connection, which is required for `sqlite::memory:` databases
        // (each connection would otherwise open an independent empty DB).
        PoolOptions::<sqlx::Sqlite>::new()
            .max_connections(1)
            .connect(url)
            .await
            .expect("could not open SQLite pool")
    }

    /// Running migrations twice on the same SQLite database must be idempotent.
    #[tokio::test]
    async fn sqlite_migration_is_idempotent() {
        let url = "sqlite::memory:";
        let pool = sqlite_pool(url).await;

        run_migrations(&pool).await.expect("first migration failed");
        run_migrations(&pool)
            .await
            .expect("second migration (idempotency) failed");
    }
}
