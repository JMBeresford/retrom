use diesel_async::{pooled_connection::AsyncDieselConnectionManager, AsyncPgConnection};
use dotenvy::dotenv;
use std::env;

pub mod models;
pub mod schema;

#[derive(Debug)]
pub struct DbError {
    pub message: String,
}

impl ToString for DbError {
    fn to_string(&self) -> String {
        self.message.clone()
    }
}

pub type Result<T> = std::result::Result<T, DbError>;

pub type Pool = bb8::Pool<AsyncDieselConnectionManager<AsyncPgConnection>>;

pub fn get_db_url() -> String {
    dotenv().ok();

    env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}
