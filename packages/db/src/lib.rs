use diesel::{migration::MigrationVersion, prelude::*};
use diesel_async::{pooled_connection::AsyncDieselConnectionManager, AsyncPgConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::fmt::Debug;

pub mod schema;

#[derive(Debug)]
pub struct DbError {
    pub message: String,
}

impl std::fmt::Display for DbError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "DbError: {}", self.message)
    }
}

pub type Result<T> = std::result::Result<T, DbError>;

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
        .map_err(|e| DbError {
            message: format!("Error running migrations: {:?}", e),
        })
}
