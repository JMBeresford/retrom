use axum::{extract::State, routing::get, Json, Router};
use db::{models::game::Game, Pool};
use diesel_async::RunQueryDsl;
use serde::Serialize;

use crate::routes::utils::{define_route_handler, internal_error, StringResponse};

#[derive(Debug, Serialize)]
pub struct GamesData {
    games: Vec<Game>,
}

pub fn get_root() -> Router<Pool> {
    async fn handler(State(pool): State<Pool>) -> Result<Json<GamesData>, StringResponse> {
        use db::schema::games::dsl::*;

        let mut conn = match pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(internal_error(why)),
        };

        let rows: Vec<Game> = match games.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(internal_error(why)),
        };

        let response = GamesData { games: rows };

        Ok(Json(response))
    }

    define_route_handler("/", get(handler))
}
