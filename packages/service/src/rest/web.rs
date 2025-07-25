use warp::{filters::BoxedFilter, Filter};

use crate::meta::RetromDirs;

#[tracing::instrument]
pub fn web() -> BoxedFilter<(impl warp::Reply,)> {
    let web_dir = RetromDirs::new().web_dir().join("dist");
    let index_path = web_dir.join("index.html");

    let get = warp::get().and(warp::fs::dir(web_dir).or(warp::fs::file(index_path)));

    warp::path("web")
        .and(get)
        .with(warp::filters::trace::request())
        .boxed()
}
