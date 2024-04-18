use derive_builder::Builder;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Selectable, Queryable)]
#[diesel(table_name = crate::schema::game_files)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct GameFile {
    pub id: uuid::Uuid,
    pub name: String,
    pub byte_size: i32,
    pub path: String,
    pub hash: String,
    pub game_id: uuid::Uuid,
}

#[derive(Debug, Clone, Builder, Deserialize, Serialize, Insertable)]
#[diesel(table_name = crate::schema::game_files)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewGameFile {
    pub id: uuid::Uuid,
    pub name: String,
    pub byte_size: i32,
    pub path: String,
    pub hash: String,
    pub game_id: uuid::Uuid,
}
