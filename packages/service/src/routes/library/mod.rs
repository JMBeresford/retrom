use self::{populate::populate_library, root::get_root};
use axum::Router;
use db::Pool;

pub mod populate;
pub mod root;

pub fn library_routes() -> Router<Pool> {
    let routes = Router::new().merge(get_root()).merge(populate_library());

    Router::new().nest("/library", routes)
}
