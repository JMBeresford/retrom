use std::sync::Arc;

use file::file;
use game::game;
use public::public;
use retrom_db::Pool;
use warp::{
    http::{HeaderMap, HeaderValue},
    Filter,
};

pub mod error;
pub mod file;
pub mod game;
mod public;

pub fn rest_service(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    let mut headers = HeaderMap::new();
    headers.insert(
        "Cross-Origin-Opener-Policy",
        HeaderValue::from_static("same-origin"),
    );
    headers.insert(
        "Cross-Origin-Embedder-Policy",
        HeaderValue::from_static("require-corp"),
    );
    headers.insert(
        "Cross-Origin-Resource-Policy",
        HeaderValue::from_static("cross-origin"),
    );

    let headers = warp::reply::with::headers(headers);

    let routes = file(pool.clone()).or(game(pool.clone())).or(public());
    let cors = warp::cors().allow_any_origin();

    warp::path("rest").and(routes).with(cors).with(headers)
}

pub fn with_db_pool(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (Arc<Pool>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || pool.clone())
}
