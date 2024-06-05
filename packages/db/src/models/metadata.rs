use super::{FromMessages, IntoMessages};
use bigdecimal::{BigDecimal, ToPrimitive};
use derive_builder::Builder;
use diesel::prelude::*;
use retrom_codegen::retrom;

#[derive(Debug, Clone, Builder, Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::metadata, check_for_backend(diesel::pg::Pg), primary_key(game_id), treat_none_as_null = true)]
pub struct MetadataRow {
    pub game_id: uuid::Uuid,
    pub description: Option<String>,
    pub cover_url: Option<String>,
    pub background_url: Option<String>,
    pub icon_url: Option<String>,
    pub igdb_id: Option<BigDecimal>,
    pub display_name: Option<String>,
}

impl FromMessages<retrom::Metadata> for MetadataRow {}
impl IntoMessages<retrom::Metadata> for MetadataRow {}

impl Into<retrom::Metadata> for MetadataRow {
    fn into(self) -> retrom::Metadata {
        retrom::Metadata {
            game_id: self.game_id.to_string(),
            description: self.description,
            cover_url: self.cover_url,
            background_url: self.background_url,
            icon_url: self.icon_url,
            igdb_id: match self.igdb_id {
                Some(igdb_id) => igdb_id.to_u64(),
                None => None,
            },
            display_name: self.display_name,
        }
    }
}

impl From<retrom::Metadata> for MetadataRow {
    fn from(metadata: retrom::Metadata) -> Self {
        Self {
            game_id: uuid::Uuid::parse_str(&metadata.game_id).unwrap(),
            description: metadata.description,
            cover_url: metadata.cover_url,
            background_url: metadata.background_url,
            icon_url: metadata.icon_url,
            igdb_id: match metadata.igdb_id {
                Some(igdb_id) => Some(BigDecimal::from(igdb_id)),
                None => None,
            },
            display_name: metadata.display_name,
        }
    }
}
