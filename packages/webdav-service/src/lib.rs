use axum::{extract::Request, response::IntoResponse, routing::any, Extension, Router};
use axum_otel::{AxumOtelOnFailure, AxumOtelOnResponse, AxumOtelSpanCreator};
use dav_server::{localfs::LocalFs, memls::MemLs, DavHandler};
use retrom_service_common::retrom_dirs::RetromDirs;
use tower_http::trace::TraceLayer;
use tracing::Level;

pub fn webdav_service(base_url: Option<&str>) -> Router {
    let dir = RetromDirs::new().data_dir().to_owned();

    tracing::debug!("WebDAV service using data directory: {:?}", dir);
    let mac_os = cfg!(target_os = "macos");

    let mut builder = DavHandler::builder()
        .filesystem(LocalFs::new(dir, false, false, mac_os))
        .locksystem(MemLs::new())
        .autoindex(false);

    if let Some(base) = base_url {
        builder = builder.strip_prefix(base);
    }

    let dav = builder.build_handler();

    Router::new()
        .route("/", any(dav_handler))
        .route("/{*tail}", any(dav_handler))
        .layer(Extension(dav))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(AxumOtelSpanCreator::new().level(Level::INFO))
                .on_response(AxumOtelOnResponse::new().level(Level::INFO))
                .on_failure(AxumOtelOnFailure::new().level(Level::ERROR)),
        )
}

async fn dav_handler(Extension(dav): Extension<DavHandler>, req: Request) -> impl IntoResponse {
    dav.handle(req).await
}
