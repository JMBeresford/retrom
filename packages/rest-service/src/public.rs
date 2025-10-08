use super::error::{handle_rejection, Error};
use http::StatusCode;
use retrom_codegen::retrom::{files::File, FilesystemNodeType};
use retrom_service_common::retrom_dirs::RetromDirs;
use std::path::PathBuf;
use warp::{
    filters::{path::Tail, BoxedFilter},
    Filter,
};

#[tracing::instrument]
pub fn public() -> BoxedFilter<(impl warp::Reply,)> {
    let public_dir = RetromDirs::new().public_dir().clone();

    let get = warp::get().and(warp::fs::dir(public_dir));
    let post = warp::post().and(post_file());
    let delete = warp::delete().and(delete_file());

    warp::path("public")
        .and(get.or(post).or(delete))
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
                    "Path must be relative to public directory".into(),
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

#[tracing::instrument]
fn delete_file() -> BoxedFilter<(impl warp::Reply,)> {
    warp::path::tail()
        .and_then(|tail: Tail| async move {
            let path = RetromDirs::new().public_dir().join(tail.as_str());

            tracing::info!("Deleting filesystem entry at {:?}", tail.as_str());
            if !path.exists() {
                tracing::warn!("Filesystem entry not found at {:?}", path);
                return Err(warp::reject::not_found());
            }

            match path.is_file() {
                true => {
                    tokio::fs::remove_file(&path).await.map_err(Error::from)?;
                }
                false => {
                    tokio::fs::remove_dir_all(&path)
                        .await
                        .map_err(Error::from)?;
                }
            }

            tracing::info!("Filesystem entry deleted from {:?}", path);

            Ok(warp::reply::with_status(
                "Deleted",
                warp::http::StatusCode::NO_CONTENT,
            ))
        })
        .recover(handle_rejection)
        .boxed()
}
