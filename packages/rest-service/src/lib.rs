use axum::{
    http::HeaderValue,
    response::{Redirect, Response},
    routing::get,
    Extension, Router,
};
use file::file_routes;
use game::game_routes;
use public::public_routes;
use retrom_db::Pool;
use std::sync::Arc;
use tower::ServiceBuilder;
use web::web_routes;
pub mod error;
pub mod file;
pub mod game;
mod public;
mod web;

pub fn rest_service(pool: Arc<Pool>) -> Router {
    let router = Router::new()
        .route("/", get(Redirect::temporary("/web")))
        .merge(file_routes())
        .merge(game_routes())
        .merge(public_routes())
        .merge(web_routes())
        .layer(Extension(pool))
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(
            ServiceBuilder::new().map_response(|mut response: Response| {
                let headers = response.headers_mut();

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
            }),
        );

    router
}
