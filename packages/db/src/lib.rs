#[cfg(feature = "sqlite")]
pub type RetromDB = sqlx::Sqlite;

#[cfg(feature = "postgres")]
pub type RetromDB = sqlx::Postgres;

pub type DbPool = sqlx::Pool<RetromDB>;

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
    #[cfg(feature = "sqlite")]
    {
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

/// Ensure the `_sqlx_migrations` table is present and pre-populate it so the
/// migration runner can handle all three upgrade scenarios:
///
/// 1. **Existing Diesel database** (`__diesel_schema_migrations` present):
///    Each applied Diesel version is translated into a `_sqlx_migrations` row
///    using the checksum that sqlx computed for the matching legacy file.  The
///    Diesel tracking table is then dropped.  The three new v2 migrations run
///    normally on the next call to [`run_migrations`].
///
/// 2. **Existing sqlx database** (`_sqlx_migrations` present with legacy rows):
///    sqlx's `ignore_missing = true` flag handles these transparently — no
///    action required here.
///
/// 3. **Fresh SQLite database**:
///    The two PL/pgSQL-only migrations (`v1_rename` and `v1_compat`) are
///    pre-marked as successfully applied so that only `v2_baseline` (which is
///    fully portable SQL) runs.
///
/// 4. **Fresh PostgreSQL database**: no action required.
async fn diesel_migration_bootstrap(pool: &DbPool, url: &str) -> Result<()> {
    let is_sqlite = url.starts_with("sqlite:");

    let mut conn = pool
        .acquire()
        .await
        .map_err(|e| Error::ConnectionError(e.to_string()))?;

    if !is_sqlite {
        // Check for a legacy Diesel migration-tracking table (PostgreSQL only).
        let has_diesel: bool = sqlx::query_scalar(
            "SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name   = '__diesel_schema_migrations'
             )",
        )
        .fetch_one(&mut *conn)
        .await
        .map_err(|e| Error::MigrationError(e.to_string()))?;

        if has_diesel {
            tracing::info!(
                "Legacy Diesel migration table detected. \
                 Translating to sqlx tracking records…"
            );

            // The legacy migrator gives us compile-time checksums for each
            // file in migrations/legacy/ so sqlx can validate them later if
            // ignore_missing is ever turned off.
            let legacy = sqlx::migrate!("./migrations/legacy");

            // Ensure the sqlx migrations table exists before inserting.
            sqlx::query(
                "CREATE TABLE IF NOT EXISTS _sqlx_migrations (
                    version        BIGINT  PRIMARY KEY,
                    description    TEXT    NOT NULL,
                    installed_on   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    success        BOOLEAN NOT NULL,
                    checksum       BYTEA   NOT NULL,
                    execution_time BIGINT  NOT NULL
                )",
            )
            .execute(&mut *conn)
            .await
            .map_err(|e| Error::MigrationError(e.to_string()))?;

            // Fetch the Diesel-applied versions (stored as VARCHAR in that table).
            let applied: Vec<(String,)> =
                sqlx::query_as("SELECT version FROM __diesel_schema_migrations ORDER BY version")
                    .fetch_all(&mut *conn)
                    .await
                    .map_err(|e| Error::MigrationError(e.to_string()))?;

            for (version_str,) in &applied {
                let version: i64 = version_str.parse().unwrap_or(0);

                if let Some(migration) = legacy.migrations.iter().find(|m| m.version == version) {
                    sqlx::query(
                        "INSERT INTO _sqlx_migrations
                             (version, description, success, checksum, execution_time)
                         VALUES ($1, $2, TRUE, $3, 0)
                         ON CONFLICT DO NOTHING",
                    )
                    .bind(migration.version)
                    .bind(migration.description.as_ref())
                    .bind(migration.checksum.as_ref())
                    .execute(&mut *conn)
                    .await
                    .map_err(|e| Error::MigrationError(e.to_string()))?;
                } else {
                    tracing::warn!(
                        version = %version_str,
                        "Diesel migration version has no matching legacy file; skipping"
                    );
                }
            }

            sqlx::query("DROP TABLE __diesel_schema_migrations")
                .execute(&mut *conn)
                .await
                .map_err(|e| Error::MigrationError(e.to_string()))?;

            tracing::info!("Diesel migration records translated successfully.");
            return Ok(());
        }

        // Scenario 2 (legacy sqlx rows): handled by ignore_missing in the caller.
        return Ok(());
    }

    // Fresh SQLite: pre-mark the two PL/pgSQL-only migrations so the runner
    // skips them and only executes v2_baseline.
    let has_sqlx_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM sqlite_master
         WHERE type = 'table' AND name = '_sqlx_migrations'",
    )
    .fetch_one(&mut *conn)
    .await
    .map_err(|e| Error::MigrationError(e.to_string()))?;

    if has_sqlx_count > 0 {
        // Existing SQLite database — nothing extra needed.
        return Ok(());
    }

    tracing::info!("Fresh SQLite database: pre-marking PostgreSQL-only migrations as applied.");

    // Match the exact schema sqlx uses when it creates this table on SQLite,
    // including the DEFAULT so that sqlx's own INSERT (which omits installed_on)
    // can rely on the column default.
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS _sqlx_migrations (
            version        INTEGER PRIMARY KEY,
            description    TEXT    NOT NULL,
            installed_on   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
            success        INTEGER NOT NULL,
            checksum       BLOB    NOT NULL,
            execution_time INTEGER NOT NULL
        )",
    )
    .execute(&mut *conn)
    .await
    .map_err(|e| Error::MigrationError(e.to_string()))?;

    let v2_migrations = sqlx::migrate!("./migrations");
    let pg_only_versions: &[i64] = &[20260419000001, 20260419000003];

    for &version in pg_only_versions {
        if let Some(migration) = v2_migrations
            .migrations
            .iter()
            .find(|m| m.version == version)
        {
            sqlx::query(
                "INSERT OR IGNORE INTO _sqlx_migrations
                     (version, description, success, checksum, execution_time)
                 VALUES ($1, $2, 1, $3, 0)",
            )
            .bind(migration.version)
            .bind(migration.description.as_ref())
            .bind(migration.checksum.as_ref())
            .execute(&mut *conn)
            .await
            .map_err(|e| Error::MigrationError(e.to_string()))?;
        }
    }

    Ok(())
}

/// Run all pending migrations against the given pool.
///
/// `url` is the connection URL used to open `pool`; it is needed to detect
/// whether the target database is SQLite so the bootstrap step can take the
/// correct path.
pub async fn run_migrations(pool: &DbPool, url: &str) -> Result<()> {
    diesel_migration_bootstrap(pool, url).await?;

    sqlx::migrate!("./migrations")
        // Legacy Diesel rows in _sqlx_migrations refer to files that have been
        // moved to migrations/legacy/.  Telling sqlx to ignore those missing
        // entries lets it simply run the three v2 migrations.
        .set_ignore_missing(true)
        .run(pool)
        .await
        .map_err(|e| Error::MigrationError(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::pool::PoolOptions;
    use sqlx::Row;

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

    async fn table_exists_sqlite(pool: &DbPool, table: &str) -> bool {
        let count: i64 = sqlx::query_scalar(&format!(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='{table}'"
        ))
        .fetch_one(pool)
        .await
        .expect("table_exists query failed");
        count > 0
    }

    /// Fresh SQLite database: v1_rename and v1_compat must be pre-marked so
    /// that only v2_baseline actually runs.  All v2 tables must exist afterwards.
    #[tokio::test]
    async fn fresh_sqlite_runs_only_v2_baseline() {
        let url = "sqlite::memory:";
        let pool = sqlite_pool(url).await;

        run_migrations(&pool, url).await.expect("migration failed");

        for table in &[
            "platforms",
            "games",
            "game_files",
            "default_game_files",
            "game_metadata",
            "platform_metadata",
            "emulators",
            "emulator_profiles",
            "tag_domains",
            "tags",
        ] {
            assert!(
                table_exists_sqlite(&pool, table).await,
                "expected table '{table}' to exist after fresh SQLite migration"
            );
        }

        // v1_rename and v1_compat are pre-marked, so no _v1_* tables should exist.
        assert!(
            !table_exists_sqlite(&pool, "_v1_platforms").await,
            "_v1_platforms must not exist on fresh SQLite"
        );

        // Well-known tag domains must be seeded.
        let domain_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM tag_domains WHERE is_well_known = 1")
                .fetch_one(&pool)
                .await
                .expect("tag_domains query failed");
        assert_eq!(domain_count, 4, "expected 4 well-known tag domains");

        // Built-in emulators must be seeded.
        let emulator_count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM emulators WHERE built_in = 1")
                .fetch_one(&pool)
                .await
                .expect("emulators query failed");
        assert_eq!(emulator_count, 42, "expected 42 built-in emulators");
    }

    /// Running migrations twice on the same SQLite database must be idempotent.
    #[tokio::test]
    async fn sqlite_migration_is_idempotent() {
        let url = "sqlite::memory:";
        let pool = sqlite_pool(url).await;

        run_migrations(&pool, url)
            .await
            .expect("first migration failed");
        run_migrations(&pool, url)
            .await
            .expect("second migration (idempotency) failed");
    }

    /// The bootstrap helper must correctly pre-mark v1_rename (20260419000001)
    /// and v1_compat (20260419000003) and leave v2_baseline (20260419000002)
    /// as pending.
    #[tokio::test]
    async fn sqlite_bootstrap_pre_marks_correct_versions() {
        let url = "sqlite::memory:";
        let pool = sqlite_pool(url).await;

        diesel_migration_bootstrap(&pool, url)
            .await
            .expect("bootstrap failed");

        let pre_marked: Vec<i64> =
            sqlx::query("SELECT version FROM _sqlx_migrations ORDER BY version")
                .fetch_all(&pool)
                .await
                .expect("query failed")
                .into_iter()
                .map(|r| r.get::<i64, _>(0))
                .collect();

        assert_eq!(
            pre_marked,
            vec![20260419000001i64, 20260419000003i64],
            "expected exactly v1_rename and v1_compat to be pre-marked"
        );
    }
}
