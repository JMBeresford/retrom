use axum::{
    body::Bytes,
    extract::Path,
    http::{header, StatusCode},
    response::Response,
    routing::get,
    Extension, Router,
};
use futures_util::TryStreamExt;
use retrom_db::DbPool;
use tokio::fs::File;
use tokio_util::io::ReaderStream;

pub fn file_routes() -> Router {
    Router::new().route("/{fileId}", get(file_handler))
}

pub async fn file_handler(
    Extension(pool): Extension<DbPool>,
    Path(file_id): Path<String>,
) -> Result<Response, StatusCode> {
    let file_path: Option<String> = {
        let mut query = sqlx::QueryBuilder::new("select absolute_path from files where id = ");
        query.push_bind(&file_id);
        query.push(" and is_deleted = ");
        query.push_bind(false);
        query
            .build_query_scalar()
            .fetch_optional(&pool)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    let file_path = match file_path {
        Some(path) => path,
        None => return Err(StatusCode::NOT_FOUND),
    };

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
