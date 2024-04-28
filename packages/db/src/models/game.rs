use super::{FromMessages, IntoMessages};
use derive_builder::Builder;
use diesel::prelude::*;
use generated::retrom;

#[derive(Debug, Clone, Queryable, Selectable, Insertable, Builder, AsChangeset)]
#[diesel(table_name = crate::schema::games, check_for_backend(diesel::pg::Pg))]
pub struct GameRow {
    pub id: uuid::Uuid,
    pub name: String,
    pub path: String,
    pub platform_id: uuid::Uuid,
}

impl FromMessages<retrom::Game> for GameRow {}
impl IntoMessages<retrom::Game> for GameRow {}

impl Into<retrom::Game> for GameRow {
    fn into(self) -> retrom::Game {
        retrom::Game {
            id: self.id.to_string(),
            name: self.name,
            path: self.path,
            platform_id: self.platform_id.to_string(),
        }
    }
}

impl From<retrom::Game> for GameRow {
    fn from(game: retrom::Game) -> Self {
        Self {
            id: uuid::Uuid::parse_str(&game.id).unwrap(),
            name: game.name,
            path: game.path,
            platform_id: uuid::Uuid::parse_str(&game.platform_id).unwrap(),
        }
    }
}
