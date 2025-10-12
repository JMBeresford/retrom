use opentelemetry::{global, trace::SpanKind};
use opentelemetry_http::HeaderExtractor;
use std::time::Duration;
use tower_http::trace::{MakeSpan, OnResponse};
use tracing::field::Empty;
use tracing_opentelemetry::OpenTelemetrySpanExt;

#[derive(Clone, Debug, Default)]
pub struct GrpcOnRequestSpan {}

impl GrpcOnRequestSpan {
    pub fn new() -> Self {
        Self::default()
    }
}

impl<B> MakeSpan<B> for GrpcOnRequestSpan {
    fn make_span(&mut self, request: &hyper::Request<B>) -> tracing::Span {
        let headers = request.headers();

        let parent_context = global::get_text_map_propagator(|propagator| {
            propagator.extract(&HeaderExtractor(headers))
        });

        let name = request
            .uri()
            .path()
            .strip_prefix("/")
            .unwrap_or(request.uri().path());

        let parts = name.split('/').collect::<Vec<_>>();
        let service = parts.first().unwrap_or(&"");
        let method = parts.get(1).unwrap_or(&"");
        let server_host = request.uri().host().unwrap_or("");
        let server_port = request
            .uri()
            .port()
            .map(|p| p.as_str().to_string())
            .unwrap_or_default();

        let user_agent = request
            .headers()
            .get(http::header::USER_AGENT)
            .map_or("", |h| h.to_str().unwrap_or(""));

        let x_forwarded_for: Vec<&str> = request
            .headers()
            .get_all("x-forwarded-for")
            .iter()
            .filter_map(|h| h.to_str().ok())
            .collect();

        let client_host = request
            .headers()
            .get(http::header::HOST)
            .and_then(|h| h.to_str().ok())
            .unwrap_or("");

        let client_parts = client_host.split(':').collect::<Vec<_>>();
        let client_address = client_parts.first().unwrap_or(&"");
        let client_port = client_parts
            .get(1)
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(0);

        let span = tracing::info_span!(
            "request_handler",
            otel.kind = ?SpanKind::Server,
            otel.name = name,
            otel.status_code = Empty,

            http.user_agent = %user_agent,
            http.x_forwarded_for = ?x_forwarded_for,

            rpc.system = "grpc",
            rpc.service = service,
            rpc.method = method,
            rpc.grpc.status_code = Empty,
            rpc.grpc.metadata.messages = Empty,

            server.address = server_host,
            server.port = server_port,

            client.address = client_address,
            client.port = client_port,

            exception.message = Empty,
            exception.details = Empty,
        );

        span.set_parent(parent_context);

        span
    }
}

#[derive(Clone, Debug, Default)]
pub struct GrpcOnResponseSpanHandler {}

impl GrpcOnResponseSpanHandler {
    pub fn new() -> Self {
        Self::default()
    }
}

impl<B> OnResponse<B> for GrpcOnResponseSpanHandler {
    fn on_response(self, response: &hyper::Response<B>, latency: Duration, span: &tracing::Span) {
        let grpc_status = response
            .headers()
            .get("grpc-status")
            .and_then(|h| h.to_str().ok())
            .map(|h| h.to_string());

        let grpc_message = response
            .headers()
            .get("grpc-message")
            .and_then(|h| h.to_str().ok())
            .map(|h| h.to_string());

        span.record("latency_ms", latency.as_millis());

        if let Some(ref grpc_message) = grpc_message {
            span.record(
                "rpc.grpc.metadata.messages",
                format!("{:#?}", vec![&grpc_message]),
            );
        }

        if let Some(grpc_status) = grpc_status {
            span.record("rpc.grpc.status_code", &grpc_status);

            if grpc_status != "0" {
                span.set_status(opentelemetry::trace::Status::error(
                    grpc_message.unwrap_or_default(),
                ));
            }
        }
    }
}
