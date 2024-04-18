use super::utils::define_route_handler;
use axum::{routing::get, Router};
use db::Pool;

fn get_root() -> Router<Pool> {
    async fn handler() -> &'static str {
        "Hello from Retrom!"
    }

    define_route_handler("/", get(handler))
}

pub fn root_routes() -> Router<Pool> {
    Router::new().merge(get_root())
}
