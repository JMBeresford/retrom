use async_zip::{tokio::write::ZipFileWriter, Compression, ZipEntryBuilder};
use axum::{
    extract::Path,
    http::{header, StatusCode},
    response::Response,
    routing::get,
    Extension, Router,
};
use retrom_db::DbPool;
use std::path::PathBuf;
use tokio_util::{compat::FuturesAsyncWriteCompatExt, io::ReaderStream};
use tracing::{instrument, warn};
use walkdir::WalkDir;

pub fn download_routes() -> Router {
    Router::new().route("/{platform_id}/{game_id}", get(game_handler))
}

#[instrument(skip_all)]
async fn game_handler(
    Extension(pool): Extension<DbPool>,
    Path((platform_id, game_id)): Path<(String, String)>,
) -> Result<Response, (StatusCode, String)> {
    let game_root_file: Option<String> = sqlx::QueryBuilder::new(
        r#"
            select f.absolute_path
            from files f
            join games g
            on g.file_root_id = f.id
            where g.id =
            "#,
    )
    .push_bind(&game_id)
    .push(" and g.platform_id = ")
    .push_bind(&platform_id)
    .push(" and f.is_deleted = ")
    .push_bind(false)
    .build_query_scalar()
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database query failed: {:?}", e),
        )
    })?;

    let game_root = match game_root_file {
        Some(root) => root,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                "No root directory found for the specified game ID and platform ID".to_string(),
            ));
        }
    };

    let root_path = PathBuf::from(&game_root);

    tracing::debug!("Downloading game files for game ID {game_id} from root directory {game_root}");

    let file_name = if root_path.is_dir() {
        root_path.file_name()
    } else {
        root_path.file_stem()
    }
    .unwrap_or_else(|| std::ffi::OsStr::new(&game_id))
    .to_string_lossy();

    tracing::info!("Creating zip archive for game with ID {game_id}");

    let (w, r) = tokio::io::duplex(65536);

    let game_files: Vec<PathBuf> = WalkDir::new(&game_root)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .map(|e| e.into_path())
        .collect();
    tokio::spawn(async move {
        let mut writer = ZipFileWriter::with_tokio(w);

        for game_file_path in &game_files {
            let relative = match game_file_path.strip_prefix(&game_root) {
                Ok(rel) => rel,
                Err(e) => {
                    warn!("Failed to strip prefix from path, skipping: {:?}", e);
                    continue;
                }
            };

            let entry_name = match relative.to_str() {
                Some(s) => s,
                None => {
                    warn!(
                        "Path contains non-UTF-8 characters, skipping: {:?}",
                        relative
                    );
                    continue;
                }
            };

            let mut file = match tokio::fs::File::open(&game_file_path).await {
                Ok(file) => file,
                Err(e) => {
                    let msg = "Failed to open file, skipping".to_string();
                    tracing::warn!("{msg}: {:?}", e);
                    continue;
                }
            };

            let entry = ZipEntryBuilder::new(entry_name.into(), Compression::Deflate);
            let stream_writer = match writer.write_entry_stream(entry).await {
                Ok(stream_writer) => stream_writer,
                Err(e) => {
                    let msg = "Failed to write entry to zip archive, skipping".to_string();
                    tracing::warn!("{msg}: {:?}", e);
                    continue;
                }
            };

            let mut stream_copy = stream_writer.compat_write();
            if let Err(e) = tokio::io::copy(&mut file, &mut stream_copy).await {
                let msg = "Failed to append file to archive,".to_string()
                    + "was the download interrupted?";
                tracing::error!("{msg}: {:?}", e);
            }

            if let Err(e) = stream_copy.into_inner().close().await {
                let msg = "Failed to close file entry".to_string();
                tracing::error!("{msg}: {:?}", e);
                return;
            }
        }

        writer.close().await.unwrap();
    });

    let body = axum::body::Body::from_stream(ReaderStream::new(r));

    let response = Response::builder()
        .header(header::CONTENT_TYPE, "application/zip")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{file_name}.zip\""),
        )
        .body(body)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("{e}:?")))?;

    Ok(response)
}
