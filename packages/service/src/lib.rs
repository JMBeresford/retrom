mod providers;
mod routes;
mod utils;

use std::time::Duration;

use crate::routes::{
    games::games_routes, library::library_routes, platforms::platform_routes, root::root_routes,
};
use axum::{extract::MatchedPath, http::Request, response::Response, Router};
use db::get_db_url;
use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use dotenvy::dotenv;
use tower_http::{classify::ServerErrorsFailureClass, trace::TraceLayer};
use tracing::{info, Span};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub async fn start_service() {
    dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db_url = get_db_url();

    let config = AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(db_url);
    let pool = bb8::Pool::builder()
        .max_size(15)
        .build(config)
        .await
        .expect("Could not create pool");

    let app = Router::new()
        .merge(root_routes())
        .merge(library_routes())
        .merge(platform_routes())
        .merge(games_routes())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|req: &Request<_>| {
                    let method = req.method();
                    let path = req.uri().path();

                    tracing::info_span!("request", method = %method, path = %path)
                })
                .on_request(|req: &Request<_>, _span: &Span| {
                    let path_handler = match req
                        .extensions()
                        .get::<MatchedPath>()
                        .map(MatchedPath::as_str)
                    {
                        Some(path) => path,
                        None => "unknown",
                    };

                    tracing::info!("Processing request handler: {path_handler}");
                })
                .on_response(|res: &Response, latency: Duration, _span: &Span| {
                    let status = res.status();

                    if !res.status().is_server_error() {
                        tracing::info!("Completed: {status} - {latency:#?}");
                    }
                })
                .on_failure(
                    |err: ServerErrorsFailureClass, latency: Duration, _span: &Span| {
                        tracing::error!("Failed: {err} - {latency:#?}");
                    },
                ),
        )
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5001").await.unwrap();

    info!("Listening on: {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
