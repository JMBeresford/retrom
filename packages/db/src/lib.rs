use diesel::{migration::MigrationVersion, prelude::*};
use diesel_async::{pooled_connection::AsyncDieselConnectionManager, AsyncPgConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use std::{env, fmt::Debug};

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

pub type Pool = bb8::Pool<AsyncDieselConnectionManager<AsyncPgConnection>>;
pub type DBConnection<'a> =
    bb8::PooledConnection<'a, AsyncDieselConnectionManager<AsyncPgConnection>>;

pub type DBConnectionSync = diesel::pg::PgConnection;

pub fn get_db_url() -> String {
    dotenv().ok();

    env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}

pub fn get_db_connection_sync() -> DBConnectionSync {
    let db_url = get_db_url();
    diesel::pg::PgConnection::establish(&db_url).expect("Could not establish connection")
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
