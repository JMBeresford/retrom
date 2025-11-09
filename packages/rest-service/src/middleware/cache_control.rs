use http::{header::CACHE_CONTROL, HeaderValue};
use tracing::instrument;

#[instrument(skip_all)]
pub async fn cache_control_middleware(
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    let mut response = next.run(request).await;

    let headers = response.headers_mut();
    headers.insert(CACHE_CONTROL, HeaderValue::from_static("no-cache"));

    response
}
