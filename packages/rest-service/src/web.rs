use axum::{routing::any_service, Router};
use retrom_service_common::retrom_dirs::RetromDirs;
use tower_http::services::{ServeDir, ServeFile};

pub fn web_routes() -> Router {
    let dir = RetromDirs::new().web_dir().join("dist");
    let index_path = dir.join("index.html");

    let index_service = ServeFile::new(index_path);
    let dir_service = ServeDir::new(dir).fallback(index_service.clone());

    Router::new()
        .route("/", any_service(index_service))
        .route("/{*tail}", any_service(dir_service.clone()))
}
