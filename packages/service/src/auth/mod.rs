use warp::{filters::BoxedFilter, Filter, Reply};
use std::sync::Arc;
use retrom_db::Pool;

pub mod authentication;

// Adds HTTP routes for auth endpoints
#[tracing::instrument(skip(pool))]
pub fn auth(
    pool: Arc<Pool>,
) -> BoxedFilter<(impl Reply,)> {
    
    let login = warp::path("login")
        .and(warp::post())
        .and(warp::body::json::<authentication::LoginRequest>())
        .and(with_db_pool(pool.clone()))
        .and_then(authentication::handle_login);

    warp::path("auth")
        .and(login)
        .with(warp::filters::trace::request())
        .boxed()
}

// Database pool filter helper (following your REST pattern)
pub fn with_db_pool(
    pool: Arc<Pool>,
) -> impl Filter<Extract = (Arc<Pool>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || pool.clone())
}