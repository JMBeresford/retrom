use axum::{body::Body, extract::State, response::Response, routing::any, Router};
use axum_otel::{AxumOtelOnFailure, AxumOtelOnResponse, AxumOtelSpanCreator};
use http::{Request, StatusCode};
use opentelemetry_otlp::{
    OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_ENDPOINT_DEFAULT,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
};
use tower_http::trace::TraceLayer;
use tracing::Level;

pub fn reverse_proxy() -> Router {
    Router::new()
        .route("/v1/traces", any(trace_handler))
        .with_state(reqwest::Client::default())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(AxumOtelSpanCreator::new().level(Level::INFO))
                .on_response(AxumOtelOnResponse::new().level(Level::INFO))
                .on_failure(AxumOtelOnFailure::new().level(Level::ERROR)),
        )
        .reset_fallback()
}

async fn trace_handler(
    State(client): State<reqwest::Client>,
    request: Request<Body>,
) -> Result<Response<Body>, StatusCode> {
    let traces_endpoint = std::env::var(OTEL_EXPORTER_OTLP_TRACES_ENDPOINT);
    let endpoint = std::env::var(OTEL_EXPORTER_OTLP_ENDPOINT)
        .unwrap_or_else(|_| OTEL_EXPORTER_OTLP_ENDPOINT_DEFAULT.to_string());

    let url = traces_endpoint.unwrap_or_else(|_| format!("{}/v1/traces", endpoint));
    let (parts, body) = request.into_parts();

    tracing::debug!("Forwarding request to upstream: {} {}", parts.method, url);

    let req_bytes = axum::body::to_bytes(body, usize::MAX).await.map_err(|e| {
        tracing::error!("Error reading request body: {}", e);
        StatusCode::BAD_REQUEST
    })?;

    let forward_request = client
        .request(parts.method, &url)
        .body(req_bytes)
        .headers(parts.headers);

    let upstream_response = forward_request.send().await.map_err(|e| {
        tracing::error!("Error forwarding request to upstream: {}", e);
        StatusCode::BAD_GATEWAY
    })?;

    let upstream_status = upstream_response.status();
    let upstream_bytes = upstream_response.bytes().await.map_err(|e| {
        tracing::error!("Error reading upstream response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let response = Response::builder()
        .status(upstream_status)
        .body(Body::from(upstream_bytes))
        .map_err(|e| {
            tracing::error!("Error building response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(response)
}
