use derive_builder::Builder;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::platforms)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Platform {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, Builder, Deserialize, Serialize, Insertable)]
#[diesel(table_name = crate::schema::platforms)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewPlatform {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: String,
}
