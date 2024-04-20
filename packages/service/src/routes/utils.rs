use axum::{http::StatusCode, routing::MethodRouter, Router};
use db::Pool;
use tracing::error;

pub fn define_route_handler(path: &str, method_router: MethodRouter<Pool>) -> Router<Pool> {
    Router::new().route(path, method_router)
}

pub type StringResponse = (StatusCode, String);

pub fn internal_error<E>(error: E) -> StringResponse
where
    E: std::error::Error,
{
    error!("Internal error: {:?}", error);
    (StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
}
