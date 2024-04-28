use super::{FromMessages, IntoMessages};
use derive_builder::Builder;
use diesel::prelude::*;
use generated::retrom;

#[derive(Debug, Clone, Builder, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::platforms, check_for_backend(diesel::pg::Pg))]
pub struct PlatformRow {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: String,
}

impl FromMessages<retrom::Platform> for PlatformRow {}
impl IntoMessages<retrom::Platform> for PlatformRow {}

impl Into<retrom::Platform> for PlatformRow {
    fn into(self) -> retrom::Platform {
        retrom::Platform {
            id: self.id.to_string(),
            name: self.name,
            path: self.path,
        }
    }
}

impl From<retrom::Platform> for PlatformRow {
    fn from(platform: retrom::Platform) -> Self {
        Self {
            id: uuid::Uuid::parse_str(&platform.id).unwrap(),
            name: platform.name,
            path: platform.path,
        }
    }
}
