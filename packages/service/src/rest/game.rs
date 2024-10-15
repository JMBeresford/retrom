use std::path::PathBuf;
use std::sync::Arc;

use diesel::associations::HasTable;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use http::header;
use retrom_codegen::retrom;
use retrom_db::{schema, Pool};
use tokio_util::io::ReaderStream;
use warp::{filters::BoxedFilter, Filter};
use zipit::{archive_size, FileDateTime};

use super::with_db_pool;

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

            let files: Vec<retrom::GameFile> = match retrom::GameFile::table()
                .filter(schema::game_files::game_id.eq(game_id))
                .load(&mut conn)
                .await
            {
                Ok(files) => files,
                Err(_) => return Err(warp::reject::not_found()),
            };

            let file_paths: Vec<PathBuf> = files
                .into_iter()
                .map(|file| PathBuf::from(file.path))
                .collect();

            let file_descriptors: Vec<(&str, usize)> = file_paths
                .iter()
                .map(|path| {
                    let file_name = path.file_name().unwrap().to_str().unwrap_or("unknown");
                    let file_size = path.metadata().unwrap().len() as usize;
                    (file_name, file_size)
                })
                .collect();

            let content_length = archive_size(file_descriptors);

            let (w, r) = tokio::io::duplex(4096);
            tokio::spawn(async move {
                let mut archive = zipit::Archive::new(w);

                for path in file_paths.iter() {
                    let file_name = path.file_name().unwrap().to_str().unwrap_or("unknown");
                    let mut file = tokio::fs::File::open(path).await.unwrap();
                    match archive
                        .append(file_name.to_string(), FileDateTime::now(), &mut file)
                        .await
                    {
                        Ok(_) => (),
                        Err(e) => {
                            let msg = "Failed to append file to archive,".to_string()
                                + "was the download interrupted?";

                            tracing::error!("{msg}: {:?}", e);
                            return;
                        }
                    };
                }

                archive
                    .finalize()
                    .await
                    .expect("Failed to finalize archive");
            });

            let body = hyper::Body::wrap_stream(ReaderStream::new(r));

            let mut response = warp::reply::Response::new(body);
            let headers = response.headers_mut();
            headers.insert(header::CONTENT_TYPE, "application/zip".parse().unwrap());
            headers.insert(
                header::CONTENT_LENGTH,
                content_length.to_string().parse().unwrap(),
            );

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
