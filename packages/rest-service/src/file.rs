use axum::{
    body::Bytes,
    extract::Path,
    http::{header, StatusCode},
    response::Response,
    routing::get,
    Extension, Router,
};
use diesel::associations::HasTable;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use futures_util::TryStreamExt;
use retrom_codegen::retrom;
use retrom_db::Pool;
use std::sync::Arc;
use tokio::fs::File;
use tokio_util::io::ReaderStream;

pub fn file_routes() -> Router {
    Router::new().nest("/file", Router::new().route("/:fileId", get(file_handler)))
}

pub async fn file_handler(
    Extension(pool): Extension<Arc<Pool>>,
    Path(file_id): Path<i32>,
) -> Result<Response, StatusCode> {
    let mut conn = pool.get().await.unwrap();

    let file_path = retrom::GameFile::table()
        .find(file_id)
        .first::<retrom::GameFile>(&mut conn)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?
        .path;

    let file = File::open(&file_path)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    let reader_stream = ReaderStream::new(file).map_ok(Bytes::from);
    let body = axum::body::Body::from_stream(reader_stream);

    let response = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/octet-stream")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{file_path}\""),
        )
        .body(body)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(response)
}
