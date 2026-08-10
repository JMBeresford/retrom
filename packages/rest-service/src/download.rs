use async_zip::{tokio::write::ZipFileWriter, Compression, ZipEntryBuilder};
use axum::{
    extract::Path,
    http::{header, StatusCode},
    response::Response,
    routing::get,
    Extension, Router,
};
use retrom_codegen::retrom::services::library::v1::{GameFileRow, RootDirectoryRow};
use retrom_db::DbPool;
use std::path::PathBuf;
use tokio_util::{compat::FuturesAsyncWriteCompatExt, io::ReaderStream};
use tracing::{instrument, warn};

pub fn download_routes() -> Router {
    Router::new().route("/{platform_id}/{game_id}", get(game_handler))
}

#[instrument(skip_all)]
async fn game_handler(
    Extension(pool): Extension<DbPool>,
    Path((platform_id, game_id)): Path<(String, String)>,
) -> Result<Response, (StatusCode, String)> {
    let game_files: Vec<GameFileRow> = {
        let mut query = sqlx::QueryBuilder::new("select * from game_files where game_id = ");
        query.push_bind(&game_id);
        query.push(" and platform_id = ");
        query.push_bind(&platform_id);
        query.push(" and is_deleted = ");
        query.push_bind(false);
        query.build_query_as().fetch_all(&pool).await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", e),
            )
        })?
    };

    // Find the root directory for this `(platform, game)` pair, by joining
    // the `root_directories`, `platform_root_diretories`, and `game_root_directories` tables.
    // A game will have a single `root_directory` where `root_directory.path` is like
    // `{prd}%` and `prd` is a platform's `root_directory.path`.
    let platform_root_dirs: Vec<RootDirectoryRow> = {
        let mut query =
            sqlx::QueryBuilder::new("select * from root_directories where platform_id = ");
        query.push_bind(&platform_id);
        query.build_query_as().fetch_all(&pool).await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", e),
            )
        })?
    };

    let game_root_dir: Option<RootDirectoryRow> = {
        let mut query = sqlx::QueryBuilder::new("select * from root_directories where game_id = ");
        query.push_bind(&game_id);
        query.push(" and (path like ");
        let mut separated = query.separated(" or path like ");
        platform_root_dirs.iter().for_each(|prd| {
            separated.push_bind(format!("{}%", prd.path));
        });

        separated.push_unseparated(")");

        query
            .build_query_as()
            .fetch_optional(&pool)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Database error: {}", e),
                )
            })?
    };

    let game_root = match game_root_dir {
        Some(root_dir) => root_dir.path,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                "No root directory found for the specified game ID and platform ID".to_string(),
            ));
        }
    };

    let src_dir = PathBuf::from(&game_root);

    tracing::debug!("Downloading game files for game ID {game_id} from root directory {game_root}");

    if game_files.is_empty() {
        return Err((
            StatusCode::NOT_FOUND,
            "No game files found for the specified game ID and platform ID".to_string(),
        ));
    }

    let file_name = if src_dir.is_dir() {
        src_dir.file_name()
    } else {
        src_dir.file_stem()
    }
    .unwrap_or_else(|| std::ffi::OsStr::new(&game_id))
    .to_string_lossy();

    tracing::info!("Creating zip archive for game with ID {game_id}");

    let (w, r) = tokio::io::duplex(4096);
    tokio::spawn(async move {
        let mut writer = ZipFileWriter::with_tokio(w);

        for game_file in &game_files {
            let game_file_path = PathBuf::from(&game_file.path);
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
