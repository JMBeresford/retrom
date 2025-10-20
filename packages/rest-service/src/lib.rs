use axum::{response::Redirect, routing::get, Extension, Router};
use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use file::file_routes;
use game::game_routes;
use public::public_routes;
use retrom_db::Pool;
use std::sync::Arc;
use tower_http::{
    compression::CompressionLayer,
    cors::{AllowOrigin, CorsLayer},
};
use web::web_routes;
pub mod error;
pub mod file;
pub mod game;
mod public;
mod web;

pub fn rest_service(pool: Arc<Pool>) -> Router {
    let routes = Router::new()
        .nest("/file", file_routes())
        .nest("/game", game_routes())
        .nest("/public", public_routes());

    Router::new()
        .nest("/rest", routes)
        // use nest_service so both /web and /web are defined
        // https://github.com/tokio-rs/axum/issues/2659#issuecomment-2676985411
        .nest_service("/web", web_routes())
        .route(
            "/",
            get(|| async { Redirect::to("/web") }).head(|| async { Redirect::to("/web") }),
        )
        .layer(CompressionLayer::new())
        .layer(Extension(pool))
        .layer(OtelInResponseLayer::default())
        .layer(OtelAxumLayer::default())
        .layer(
            CorsLayer::new()
                .allow_origin(AllowOrigin::mirror_request())
                .allow_credentials(true),
        )
    // .layer(
    //     ServiceBuilder::new().map_response(|mut response: Response| {
    //         let headers = response.headers_mut();
    //
    //         // TODO: Re-enable after solving cross-origin isolation problems:
    //         // 1. impl metadata cache, served from service
    //         // 2. eventual oauth / OIDC support requiring cross-origin access
    //         // headers.insert(
    //         //     "Cross-Origin-Opener-Policy",
    //         //     HeaderValue::from_static("same-origin"),
    //         // );
    //         // headers.insert(
    //         //     "Cross-Origin-Embedder-Policy",
    //         //     HeaderValue::from_static("require-corp"),
    //         // );
    //         headers.insert(
    //             "Cross-Origin-Resource-Policy",
    //             HeaderValue::from_static("cross-origin"),
    //         );
    //     }),
    // )
}
