use std::collections::HashMap;

use axum::{
    extract::{Path, Query, State},
    routing::get,
    Json, Router,
};
use db::{
    models::{game::Game, game_file::GameFile},
    schema::{game_files, games},
    Pool,
};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use tracing::info;
use uuid::Uuid;

use crate::routes::utils::{define_route_handler, internal_error, StringResponse};

#[derive(Debug, Serialize)]
pub struct GameData {
    game: Game,
    game_files: Option<Vec<GameFile>>,
}

pub fn get_games() -> Router<Pool> {
    async fn handler(
        State(pool): State<Pool>,
        Path(path_id): Path<String>,
        Query(params): Query<HashMap<String, String>>,
    ) -> Result<Json<GameData>, StringResponse> {
        let mut conn = match pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(internal_error(why)),
        };

        let game_id = match Uuid::parse_str(&path_id) {
            Ok(game_id) => game_id,
            Err(why) => return Err(internal_error(why)),
        };

        let row: Game = match games::table
            .filter(games::id.eq(game_id))
            .first(&mut conn)
            .await
        {
            Ok(row) => row,
            Err(why) => return Err(internal_error(why)),
        };

        let mut response = GameData {
            game: row,
            game_files: None,
        };

        if let Some(_) = params.get("with_game_files") {
            let game_files: Vec<GameFile> = match game_files::table
                .filter(game_files::game_id.eq(game_id))
                .load(&mut conn)
                .await
            {
                Ok(files) => files,
                Err(why) => return Err(internal_error(why)),
            };

            response.game_files = Some(game_files);
        }

        let mut igdb_provider = crate::providers::igdb::provider::IGDBProvider::new();
        let search = response.game.name.to_string();
        let igdb_game = igdb_provider.get_games(search).await.expect("asd");

        info!("IGDB Game: {:?}", igdb_game);

        Ok(Json(response))
    }

    define_route_handler("/:id", get(handler))
}
