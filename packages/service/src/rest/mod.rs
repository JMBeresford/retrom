use std::sync::Arc;

use file::file;
use game::game;
use public::public;
use retrom_db::Pool;
use warp::{
    http::{HeaderMap, HeaderValue},
    Filter,
};
use web::web;

pub mod error;
pub mod file;
pub mod game;
mod public;
mod web;

pub fn rest_service(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    let mut headers = HeaderMap::new();

    // TODO: Re-enable after solving cross-origin isolation problems:
    // 1. impl metadata cache, served from service
    // 2. eventual oauth / OIDC support requiring cross-origin access
    // headers.insert(
    //     "Cross-Origin-Opener-Policy",
    //     HeaderValue::from_static("same-origin"),
    // );
    // headers.insert(
    //     "Cross-Origin-Embedder-Policy",
    //     HeaderValue::from_static("require-corp"),
    // );
    headers.insert(
        "Cross-Origin-Resource-Policy",
        HeaderValue::from_static("cross-origin"),
    );

    let headers = warp::reply::with::headers(headers);

    let routes = warp::path("rest")
        .and(file(pool.clone()).or(game(pool.clone())).or(public()))
        .or(web());

    let cors = warp::cors().allow_any_origin();

    routes.with(cors).with(headers)
}

pub fn with_db_pool(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (Arc<Pool>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || pool.clone())
}
