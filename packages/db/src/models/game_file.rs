use super::{FromMessages, IntoMessages};
use derive_builder::Builder;
use diesel::prelude::*;
use retrom_codegen::retrom;

#[derive(Debug, Clone, Builder, Selectable, Queryable, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::game_files, check_for_backend(diesel::pg::Pg))]
pub struct GameFileRow {
    pub id: uuid::Uuid,
    pub name: String,
    pub byte_size: i32,
    pub path: String,
    pub sha1: Option<String>,
    pub game_id: uuid::Uuid,
}

impl FromMessages<retrom::GameFile> for GameFileRow {}
impl IntoMessages<retrom::GameFile> for GameFileRow {}

impl Into<retrom::GameFile> for GameFileRow {
    fn into(self) -> retrom::GameFile {
        retrom::GameFile {
            id: self.id.to_string(),
            name: self.name,
            byte_size: self.byte_size,
            path: self.path,
            sha1: self.sha1,
            game_id: self.game_id.to_string(),
        }
    }
}

impl From<retrom::GameFile> for GameFileRow {
    fn from(game_file: retrom::GameFile) -> Self {
        Self {
            id: uuid::Uuid::parse_str(&game_file.id).unwrap(),
            name: game_file.name,
            byte_size: game_file.byte_size,
            path: game_file.path,
            sha1: game_file.sha1,
            game_id: uuid::Uuid::parse_str(&game_file.game_id).unwrap(),
        }
    }
}
