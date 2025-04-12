use super::error::{handle_rejection, Error};
use crate::meta::RetromDirs;
use http::StatusCode;
use retrom_codegen::retrom::{files::File, FilesystemNodeType};
use std::path::PathBuf;
use warp::{filters::BoxedFilter, Filter};

#[tracing::instrument]
pub fn public() -> BoxedFilter<(impl warp::Reply,)> {
    let public_dir = RetromDirs::new().public_dir().clone();

    warp::path("public")
        .and(warp::get().and(warp::fs::dir(public_dir)))
        .or(warp::post().and(post_file()))
        .with(warp::filters::trace::request())
        .boxed()
}

#[tracing::instrument]
fn post_file() -> BoxedFilter<(impl warp::Reply,)> {
    warp::body::json::<File>()
        .and_then(|file: File| async move {
            let stat = match file.stat {
                Some(stat) => stat,
                None => {
                    return Err(warp::reject::custom(Error::StatusCode(
                        StatusCode::BAD_REQUEST,
                        "File stat not provided".into(),
                    )))
                }
            };

            if PathBuf::from(&stat.path).is_absolute() {
                return Err(warp::reject::custom(Error::StatusCode(
                    StatusCode::BAD_REQUEST,
                    "Path must be relative to publid directory".into(),
                )));
            }

            let path = RetromDirs::new().public_dir().join(stat.path);

            match FilesystemNodeType::try_from(stat.node_type) {
                Ok(FilesystemNodeType::File) => {
                    if let Some(parent) = path.parent() {
                        tokio::fs::create_dir_all(parent)
                            .await
                            .map_err(Error::from)?;
                    }
                }
                _ => {
                    return Err(warp::reject::custom(Error::StatusCode(
                        StatusCode::BAD_REQUEST,
                        "Only files are supported".into(),
                    )))
                }
            }

            tokio::fs::write(&path, file.content)
                .await
                .map_err(Error::from)?;

            tracing::info!("File written to {:?}", path);

            Ok(warp::reply::with_status(
                "Created",
                warp::http::StatusCode::CREATED,
            ))
        })
        .recover(handle_rejection)
        .boxed()
}
