use async_zip::{tokio::write::ZipFileWriter, Compression, ZipEntryBuilder};
use axum::{
    extract::Path,
    http::{header, StatusCode},
    response::Response,
    routing::get,
    Extension, Router,
};
use diesel::associations::HasTable;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom;
use retrom_db::Pool;
use std::path::PathBuf;
use std::sync::Arc;
use tokio_util::{compat::FuturesAsyncWriteCompatExt, io::ReaderStream};
use tracing::{instrument, warn};
use walkdir::WalkDir;

pub fn game_routes() -> Router {
    Router::new().nest("/game", Router::new().route(":gameId", get(game_handler)))
}

#[instrument(skip_all)]
pub async fn game_handler(
    Extension(pool): Extension<Arc<Pool>>,
    Path(game_id): Path<i32>,
) -> Result<Response, StatusCode> {
    let mut conn = pool.get().await.unwrap();

    let game = match retrom::Game::table()
        .find(game_id)
        .first::<retrom::Game>(&mut conn)
        .await
    {
        Ok(game) => game,
        Err(_) => return Err(StatusCode::NOT_FOUND),
    };

    let game_path = PathBuf::from(game.path);

    let file_name = match game_path.is_dir() {
        true => game_path
            .file_name()
            .unwrap()
            .to_str()
            .unwrap_or("unknown")
            .to_string(),
        false => game_path
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap_or("unknown")
            .to_string(),
    };

    let (w, r) = tokio::io::duplex(4096);
    tokio::spawn(async move {
        let mut writer = ZipFileWriter::with_tokio(w);
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

        let src_dir = match game_path.clone().is_dir() {
            true => game_path.clone(),
            false => game_path.clone().parent().unwrap().to_path_buf(),
        };

        for entry in it {
            let path = entry.path();

            let file_name = path.strip_prefix(&src_dir).unwrap().to_str().unwrap();
            let mut file = match tokio::fs::File::open(path).await {
                Ok(file) => file,
                Err(e) => {
                    let msg = "Failed to open file, skipping".to_string();
                    tracing::warn!("{msg}: {:?}", e);
                    continue;
                }
            };

            let entry = ZipEntryBuilder::new(file_name.into(), Compression::Deflate);
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
