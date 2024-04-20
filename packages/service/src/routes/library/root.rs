use super::super::utils::define_route_handler;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use db::{models, schema, Pool};
use diesel_async::RunQueryDsl;
use library_manager::library::game_library::GameLibrary;
use tracing::{error, instrument};

pub fn get_root() -> Router<Pool> {
    #[instrument(name = "GET /library")]
    async fn handler(State(pool): State<Pool>) -> Response {
        let mut conn = match pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                error!("Could not get database connection: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        let platforms = match schema::platforms::table
            .load::<models::platform::Platform>(&mut conn)
            .await
        {
            Ok(platforms) => platforms,
            Err(why) => {
                error!("Could not get platforms: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        let games = match schema::games::table
            .load::<models::game::Game>(&mut conn)
            .await
        {
            Ok(games) => games,
            Err(why) => {
                error!("Could not get games: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        let game_files = match schema::game_files::table
            .load::<models::game_file::GameFile>(&mut conn)
            .await
        {
            Ok(game_files) => game_files,
            Err(why) => {
                error!("Could not get game files: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        let library = GameLibrary {
            platforms,
            games,
            game_files,
        };

        (StatusCode::OK, Json(library)).into_response()
    }

    define_route_handler("/", get(handler))
}
