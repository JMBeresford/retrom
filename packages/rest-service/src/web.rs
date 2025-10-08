use warp::{filters::BoxedFilter, Filter};

use retrom_service_common::retrom_dirs::RetromDirs;

#[tracing::instrument]
pub fn web() -> BoxedFilter<(impl warp::Reply,)> {
    let dir = RetromDirs::new().web_dir().join("dist");
    let index_path = dir.join("index.html");

    let get = warp::get().and(warp::fs::dir(dir).or(warp::fs::file(index_path)));

    warp::path("web")
        .and(get)
        .with(warp::filters::trace::request())
        .boxed()
}
