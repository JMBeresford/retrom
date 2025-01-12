use diesel::{migration::MigrationVersion, prelude::*};
use diesel_async::{pooled_connection::AsyncDieselConnectionManager, AsyncPgConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::fmt::Debug;

pub mod schema;

#[cfg(feature = "embedded")]
pub mod embedded;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Error running migrations: {0}")]
    MigrationError(String),

    #[cfg(feature = "embedded")]
    #[error("Embedded DB error")]
    EmbeddedError(#[from] postgresql_embedded::Error),

    #[error("Could not create embedded database")]
    NotExists,

    #[error(transparent)]
    IOError(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

pub type PoolConfig = AsyncDieselConnectionManager<AsyncPgConnection>;
pub type Pool = deadpool::managed::Pool<PoolConfig>;
pub type DBConnection = deadpool::managed::Object<PoolConfig>;

pub type DBConnectionSync = diesel::pg::PgConnection;

pub fn get_db_connection_sync(
    db_url: &str,
) -> std::result::Result<DBConnectionSync, diesel::ConnectionError> {
    diesel::pg::PgConnection::establish(db_url)
}

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn run_migrations(
    conn: &mut impl MigrationHarness<diesel::pg::Pg>,
) -> Result<Vec<MigrationVersion>> {
    conn.run_pending_migrations(MIGRATIONS)
        .map_err(|e| Error::MigrationError(e.to_string()))
}
