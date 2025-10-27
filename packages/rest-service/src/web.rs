use axum::{routing::any_service, Router};
use bytes::Bytes;
use http_body_util::Full;
use opentelemetry::trace::TraceContextExt;
use retrom_service_common::retrom_dirs::RetromDirs;
use tower_http::{
    services::{ServeDir, ServeFile},
    ServiceExt,
};
use tracing_opentelemetry::OpenTelemetrySpanExt;

pub fn web_routes() -> Router {
    let dir = RetromDirs::new().web_dir().join("dist");
    let index_path = dir.join("index.html");

    let index_service = ServeFile::new(index_path).map_response_body(|_| {
        let index_html =
            match std::fs::read_to_string(RetromDirs::new().web_dir().join("dist/index.html")) {
                Ok(content) => content,
                Err(_) => String::from("<html><body><h1>Index file not found</h1></body></html>"),
            };

        let current_span = tracing::Span::current();
        let ctx = current_span.context();
        let otel_span = ctx.span();
        let trace_id = otel_span.span_context().trace_id();
        let span_id = otel_span.span_context().span_id();

        tracing::info!("CURRENT CTX STUFF: {:?} {}", current_span.id(), span_id);

        let meta_tag =
            format!("<meta name=\"traceparent\" content=\"00-{trace_id}-{span_id}-01\">");

        if let Some(pos) = index_html.find("<head>") {
            let mut new_index_html = String::new();
            new_index_html.push_str(&index_html[..pos]);
            new_index_html.push_str(&meta_tag);
            new_index_html.push_str(&index_html[pos..]);

            Full::new(Bytes::from(new_index_html))
        } else {
            Full::new(Bytes::from(index_html))
        }
    });

    let dir_service = ServeDir::new(dir).fallback(index_service.clone());

    Router::new()
        .route("/", any_service(index_service))
        .route("/{*tail}", any_service(dir_service.clone()))
}
