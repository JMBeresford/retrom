use derive_builder::Builder;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Selectable)]
#[diesel(table_name = crate::schema::metadata)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Metadata {
    pub game_id: uuid::Uuid,
    pub description: String,
    pub cover_url: String,
    pub background_url: String,
}

#[derive(Debug, Clone, Builder, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::metadata)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewMetadata {
    pub game_id: uuid::Uuid,
    pub description: String,
    pub cover_url: String,
    pub background_url: String,
}
