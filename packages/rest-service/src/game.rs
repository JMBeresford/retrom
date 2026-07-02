use async_zip::{tokio::write::ZipFileWriter, Compression, ZipEntryBuilder};
use axum::{
    extract::Path,
    http::{header, StatusCode},
    response::Response,
    routing::get,
    Extension, Router,
};
use retrom_codegen::retrom::services::library::v1::GameFile;
use retrom_db::DbPool;
use std::path::PathBuf;
use tokio_util::{compat::FuturesAsyncWriteCompatExt, io::ReaderStream};
use tracing::{instrument, warn};
use walkdir::WalkDir;

pub fn game_routes() -> Router {
    Router::new().route("/{gameId}", get(game_handler))
}

#[instrument(skip_all)]
pub async fn game_handler(
    Extension(pool): Extension<DbPool>,
    Path(game_id): Path<String>,
) -> Result<Response, StatusCode> {
    let game_files: Vec<GameFile> = {
        let mut query = sqlx::QueryBuilder::<retrom_db::RetromDB>::new(
            "select * from game_files where game_id = ",
        );
        query.push_bind(&game_id);
        query.push(" and is_deleted = ");
        query.push_bind(false);
        query
            .build_query_as()
            .fetch_all(&pool)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    if game_files.is_empty() {
        return Err(StatusCode::NOT_FOUND);
    }

    let first_path = PathBuf::from(&game_files[0].path);
    tracing::info!("Creating zip archive for game with ID {game_id}");

    let file_name = match first_path.is_dir() {
        true => first_path
            .file_name()
            .unwrap()
            .to_str()
            .unwrap_or("unknown")
            .to_string(),
        false => first_path
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap_or("unknown")
            .to_string(),
    };

    let (w, r) = tokio::io::duplex(4096);
    tokio::spawn(async move {
        let mut writer = ZipFileWriter::with_tokio(w);

        for game_file in &game_files {
            let game_path = PathBuf::from(&game_file.path);
            let walkdir = WalkDir::new(game_path.clone());
            let it = walkdir.into_iter().filter_map(|entry| match entry {
                Ok(entry) => match entry.path().is_file() {
                    true => Some(entry),
                    false => None,
                },
                Err(e) => {
                    warn!("Failed to walk directory: {:?}", e);
                    None
                }
            });

            let src_dir = match game_path.is_dir() {
                true => game_path.clone(),
                false => match game_path.parent() {
                    Some(parent) => parent.to_path_buf(),
                    None => game_path.clone(),
                },
            };

            for entry in it {
                let path = entry.path();

                let relative = match path.strip_prefix(&src_dir) {
                    Ok(rel) => rel,
                    Err(e) => {
                        warn!("Failed to strip prefix from path, skipping: {:?}", e);
                        continue;
                    }
                };
                let entry_name = match relative.to_str() {
                    Some(s) => s,
                    None => {
                        warn!("Path contains non-UTF-8 characters, skipping: {:?}", relative);
                        continue;
                    }
                };
                let mut file = match tokio::fs::File::open(path).await {
                    Ok(file) => file,
                    Err(e) => {
                        let msg = "Failed to open file, skipping".to_string();
                        tracing::warn!("{msg}: {:?}", e);
                        continue;
                    }
                };

                let entry = ZipEntryBuilder::new(entry_name.into(), Compression::Deflate);
                let stream_writer = writer.write_entry_stream(entry).await.unwrap();

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
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(response)
}
