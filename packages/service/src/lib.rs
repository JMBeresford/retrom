mod middleware;
mod routes;
mod utils;

use crate::routes::{library::library_routes, platforms::platform_routes, root::root_routes};
use axum::Router;
use db::get_db_url;
use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use tracing::{info, instrument};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[instrument]
pub async fn start_service() {
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
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5001").await.unwrap();

    info!("Listening on: {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
