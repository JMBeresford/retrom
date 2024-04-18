use axum::{routing::MethodRouter, Router};
use db::Pool;

pub fn define_route_handler(path: &str, method_router: MethodRouter<Pool>) -> Router<Pool> {
    Router::new().route(path, method_router)
}
