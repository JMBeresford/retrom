use axum::{
    http::{StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::post,
    Json, Router,
};
use retrom_codegen::retrom::{files::File, FilesystemNodeType};
use retrom_service_common::retrom_dirs::RetromDirs;
use std::path::PathBuf;
use tower_http::services::ServeDir;

pub fn public_routes() -> Router {
    Router::new()
        .route("/public", post(post_file).delete(delete_file))
        .fallback_service(dir_service())
}

fn dir_service() -> ServeDir {
    let public_dir = RetromDirs::new().public_dir().clone();
    ServeDir::new(public_dir)
}

#[tracing::instrument]
async fn post_file(Json(file): Json<File>) -> Result<Response, StatusCode> {
    let stat = match file.stat {
        Some(stat) => stat,
        None => return Err(StatusCode::BAD_REQUEST),
    };

    if PathBuf::from(&stat.path).is_absolute() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let path = RetromDirs::new().public_dir().join(stat.path);

    match FilesystemNodeType::try_from(stat.node_type) {
        Ok(FilesystemNodeType::File) => {
            if let Some(parent) = path.parent() {
                tokio::fs::create_dir_all(parent)
                    .await
                    .map_err(|_| StatusCode::NOT_FOUND)?;
            }
        }
        _ => return Err(StatusCode::BAD_REQUEST),
    }

    tokio::fs::write(&path, file.content)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::info!("File written to {:?}", path);

    Ok((StatusCode::CREATED, "Created").into_response())
}

#[tracing::instrument]
async fn delete_file(tail: Uri) -> Result<Response, StatusCode> {
    let path = RetromDirs::new().public_dir().join(tail.path());

    tracing::info!("Deleting filesystem entry at {:?}", tail.path());
    if !path.exists() {
        tracing::warn!("Filesystem entry not found at {:?}", path);
        return Err(StatusCode::NOT_FOUND);
    }

    match path.is_file() {
        true => {
            tokio::fs::remove_file(&path)
                .await
                .map_err(|_| StatusCode::NOT_FOUND)?;
        }
        false => {
            tokio::fs::remove_dir_all(&path)
                .await
                .map_err(|_| StatusCode::NOT_FOUND)?;
        }
    }

    tracing::info!("Filesystem entry deleted from {:?}", path);

    Ok((StatusCode::OK, "Deleted").into_response())
}
