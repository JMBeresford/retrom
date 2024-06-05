use std::sync::Arc;

use retrom_db::Pool;
use warp::Filter;

pub mod file;
pub mod game;

pub fn rest_service(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    let routes =
        warp::path("rest").and(file::get_file(pool.clone()).or(game::get_game_files(pool.clone())));

    let cors = warp::cors().allow_origin("http://localhost:3000");

    routes.with(cors)
}

pub fn with_db_pool(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (Arc<Pool>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || pool.clone())
}
