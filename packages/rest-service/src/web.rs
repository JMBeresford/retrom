use axum::Router;
use retrom_service_common::retrom_dirs::RetromDirs;
use tower_http::services::{ServeDir, ServeFile};

pub fn web_routes() -> Router {
    let dir = RetromDirs::new().web_dir().join("dist");
    let index_path = dir.join("index.html");

    let dir_service = ServeDir::new(dir);
    let index_service = ServeFile::new(index_path);

    Router::new()
        .nest_service("/web", dir_service)
        .fallback_service(index_service)
}
