use self::{id::get_platform, root::get_root};
use axum::Router;
use db::Pool;

pub mod id;
pub mod root;

pub fn platform_routes() -> Router<Pool> {
    let routes = Router::new().merge(get_root()).merge(get_platform());

    Router::new().nest("/platforms", routes)
}
