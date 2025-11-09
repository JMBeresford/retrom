use http::HeaderValue;
use tracing::instrument;

#[instrument]
pub async fn cross_origin_isolation_middleware(
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    let mut response = next.run(request).await;

    let headers = response.headers_mut();

    headers.insert(
        "Cross-Origin-Opener-Policy",
        HeaderValue::from_static("same-origin"),
    );
    headers.insert(
        "Cross-Origin-Embedder-Policy",
        HeaderValue::from_static("credentialless"),
    );

    response
}
