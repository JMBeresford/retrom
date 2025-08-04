use crate::meta::RetromDirs;
use warp::{filters::BoxedFilter, Filter, Reply};

/// Create a media serving filter that serves cached media files
#[tracing::instrument]
pub fn media() -> BoxedFilter<(impl Reply,)> {
    let retrom_dirs = RetromDirs::new();
    let media_dir = retrom_dirs.media_dir();

    warp::path("media")
        .and(warp::get())
        .and(warp::fs::dir(media_dir))
        .with(warp::filters::trace::request())
        .boxed()
}