use derive_builder::Builder;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Selectable)]
#[diesel(table_name = crate::schema::games)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Game {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: String,
    pub platform_id: uuid::Uuid,
}

#[derive(Debug, Clone, Builder, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::games)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewGame {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: String,
    pub platform_id: uuid::Uuid,
}
