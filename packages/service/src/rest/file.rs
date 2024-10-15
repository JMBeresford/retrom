use std::path::PathBuf;
use std::sync::Arc;

use diesel::associations::HasTable;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use http::header;
use retrom_codegen::retrom;
use retrom_db::Pool;
use tokio_util::io::ReaderStream;
use warp::{filters::BoxedFilter, Filter};

use super::with_db_pool;

pub fn get_file(pool: Arc<Pool>) -> BoxedFilter<(impl warp::Reply,)> {
    warp::path!("file" / i32)
        .and(warp::get())
        .and(with_db_pool(pool))
        .and_then(|file_id: i32, pool: Arc<Pool>| async move {
            let mut conn = pool.get().await.unwrap();

            let file = match retrom::GameFile::table()
                .find(file_id)
                .first::<retrom::GameFile>(&mut conn)
                .await
            {
                Ok(game_file) => PathBuf::from(game_file.path),
                Err(_) => return Err(warp::reject::not_found()),
            };

            let file_name = match file.is_dir() {
                true => file
                    .file_name()
                    .unwrap()
                    .to_str()
                    .unwrap_or("unknown")
                    .to_string(),
                false => file
                    .file_stem()
                    .unwrap()
                    .to_str()
                    .unwrap_or("unknown")
                    .to_string(),
            };

            let file = match tokio::fs::File::open(file).await {
                Ok(file) => file,
                Err(_) => return Err(warp::reject::not_found()),
            };

            let reader_stream = ReaderStream::new(file);
            let body = hyper::Body::wrap_stream(reader_stream);

            let mut response = warp::reply::Response::new(body);
            let headers = response.headers_mut();
            headers.insert(
                header::CONTENT_TYPE,
                "application/octet-stream".parse().unwrap(),
            );
            headers.insert(
                header::CONTENT_DISPOSITION,
                format!("attachment; filename=\"{file_name}\"")
                    .parse()
                    .unwrap(),
            );

            Ok(response)
        })
        .boxed()
}
