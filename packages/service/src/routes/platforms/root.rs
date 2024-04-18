use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use db::{models::platform::Platform, Pool};
use diesel_async::RunQueryDsl;
use tracing::{error, instrument};

use crate::routes::utils::define_route_handler;

pub fn get_root() -> Router<Pool> {
    #[instrument(name = "GET /platforms")]
    async fn handler(State(pool): State<Pool>) -> Response {
        use db::schema::platforms::dsl::*;

        let mut conn = match pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                error!("Could not get database connection: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        let rows: Vec<Platform> = match platforms.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => {
                error!("Could not get platforms: {:?}", why);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        };

        (StatusCode::OK, Json(rows)).into_response()
    }

    define_route_handler("/", get(handler))
}
