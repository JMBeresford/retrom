use std::collections::HashMap;

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use db::{
    models::{game::Game, platform::Platform},
    schema::{games, platforms},
    Pool,
};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Serialize;
use tracing::{error, instrument};
use uuid::Uuid;

use crate::routes::utils::define_route_handler;

#[derive(Debug, Serialize)]
struct PlatformWithGames {
    platform: Platform,
    games: Vec<Game>,
}

pub fn get_platform() -> Router<Pool> {
    #[instrument(name = "GET /platforms")]
    async fn handler(
        State(pool): State<Pool>,
        Path(path_id): Path<String>,
        Query(params): Query<HashMap<String, String>>,
    ) -> Response {
        let mut conn = match pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                error!("Could not get database connection: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        let platform_id = match Uuid::parse_str(&path_id) {
            Ok(platform_id) => platform_id,
            Err(why) => {
                error!("Could not parse platform ID: {:?}", why);
                return StatusCode::BAD_REQUEST.into_response();
            }
        };

        let row: Platform = match platforms::table
            .filter(platforms::id.eq(platform_id))
            .first(&mut conn)
            .await
        {
            Ok(rows) => rows,
            Err(why) => {
                error!("Could not get platforms: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        if let Some(_) = params.get("with_games") {
            let games = match games::table
                .filter(games::platform_id.eq(platform_id))
                .load::<Game>(&mut conn)
                .await
            {
                Ok(games) => games,
                Err(why) => {
                    error!("Could not get games: {:?}", why);
                    return StatusCode::INTERNAL_SERVER_ERROR.into_response();
                }
            };

            let response = PlatformWithGames {
                platform: row,
                games,
            };

            return (StatusCode::OK, Json(response)).into_response();
        }

        (StatusCode::OK, Json(row)).into_response()
    }

    define_route_handler("/:id", get(handler))
}
