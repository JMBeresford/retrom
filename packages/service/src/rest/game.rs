use std::path::PathBuf;
use std::sync::Arc;

use async_zip::{tokio::write::ZipFileWriter, Compression, ZipEntryBuilder};
use diesel::associations::HasTable;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use http::header;
use retrom_codegen::retrom;
use retrom_db::Pool;
use tokio_util::{compat::FuturesAsyncWriteCompatExt, io::ReaderStream};
use tracing::{instrument, warn};
use walkdir::WalkDir;
use warp::{filters::BoxedFilter, Filter};

use super::with_db_pool;

#[instrument(skip_all)]
pub fn get_game_files(pool: Arc<Pool>) -> BoxedFilter<(impl warp::Reply,)> {
    warp::path!("game" / i32)
        .and(warp::get())
        .and(with_db_pool(pool))
        .and_then(|game_id: i32, pool: Arc<Pool>| async move {
            let mut conn = pool.get().await.unwrap();

            let game = match retrom::Game::table()
                .find(game_id)
                .first::<retrom::Game>(&mut conn)
                .await
            {
                Ok(game) => game,
                Err(_) => return Err(warp::reject::not_found()),
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

            let body = hyper::Body::wrap_stream(ReaderStream::new(r));

            let mut response = warp::reply::Response::new(body);
            let headers = response.headers_mut();
            headers.insert(header::CONTENT_TYPE, "application/zip".parse().unwrap());

            headers.insert(
                header::CONTENT_DISPOSITION,
                format!("attachment; filename=\"{file_name}.zip\"")
                    .parse()
                    .unwrap(),
            );

            Ok(response)
        })
        .boxed()
}
