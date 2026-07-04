use axum::{
    middleware::{self as axum_middleware},
    response::Redirect,
    routing::get,
    Extension, Router,
};
use axum_otel::{AxumOtelOnFailure, AxumOtelOnResponse, AxumOtelSpanCreator};
use download::download_routes;
use file::file_routes;
use middleware::{
    cache_control::cache_control_middleware,
    cross_origin_isolation::cross_origin_isolation_middleware,
};
use public::public_routes;
use retrom_db::DbPool;
use tower_http::{
    compression::CompressionLayer, cors::CorsLayer, decompression::RequestDecompressionLayer,
    trace::TraceLayer,
};
use tracing::Level;
use web::web_routes;

pub mod download;
pub mod error;
pub mod file;
mod middleware;
mod public;
mod web;

pub fn rest_service(pool: DbPool) -> Router {
    let api_routes = Router::new()
        .nest("/file", file_routes())
        .nest("/download", download_routes())
        .nest("/public", public_routes());

    Router::new()
        .nest("/rest", api_routes)
        // use nest_service so both `/web` and `/web/` are defined
        // https://github.com/tokio-rs/axum/issues/2659#issuecomment-2676985411
        .nest_service("/web", web_routes())
        .route(
            "/",
            get(|| async { Redirect::to("/web") }).head(|| async { Redirect::to("/web") }),
        )
        .layer(axum_middleware::from_fn(cross_origin_isolation_middleware))
        .layer(axum_middleware::from_fn(cache_control_middleware))
        .layer(Extension(pool))
        .layer(CorsLayer::permissive())
        .layer(RequestDecompressionLayer::new())
        .layer(CompressionLayer::new())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(AxumOtelSpanCreator::new().level(Level::INFO))
                .on_response(AxumOtelOnResponse::new().level(Level::INFO))
                .on_failure(AxumOtelOnFailure::new().level(Level::ERROR)),
        )
        .reset_fallback()
}
