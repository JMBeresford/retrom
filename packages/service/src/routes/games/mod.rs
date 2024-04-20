use self::{id::get_games, root::get_root};
use axum::Router;
use db::Pool;

pub mod id;
pub mod root;

pub fn games_routes() -> Router<Pool> {
    let routes = Router::new().merge(get_root()).merge(get_games());

    Router::new().nest("/games", routes)
}
