use futures_util::future::BoxFuture;
use opentelemetry::{global, trace::SpanKind};
use opentelemetry_http::{HeaderExtractor, HeaderInjector};
use std::time::Duration;
use tower::{Layer, Service};
use tower_http::trace::{MakeSpan, OnResponse};
use tracing::{field::Empty, Instrument};
use tracing_opentelemetry::OpenTelemetrySpanExt;

#[derive(Clone, Debug, Default)]
pub struct GrpcClientSpanLayer {}

impl GrpcClientSpanLayer {
    pub fn new() -> Self {
        Self::default()
    }
}

impl<S> Layer<S> for GrpcClientSpanLayer {
    type Service = GrpcClientSpanService<S>;

    fn layer(&self, service: S) -> Self::Service {
        GrpcClientSpanService { inner: service }
    }
}

#[derive(Clone)]
pub struct GrpcClientSpanService<S> {
    inner: S,
}

impl<S, ReqBody> Service<http::Request<ReqBody>> for GrpcClientSpanService<S>
where
    S: Service<http::Request<ReqBody>> + Clone + Send + 'static,
    S::Error: Into<tonic::transport::Error> + Send + Sync,
    S::Future: Send + 'static,
    ReqBody: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut request: http::Request<ReqBody>) -> Self::Future {
        let path = request
            .uri()
            .path()
            .strip_prefix("/")
            .unwrap_or(request.uri().path());

        let parts = path.split('/').collect::<Vec<_>>();
        let service = parts.first().unwrap_or(&"");
        let method = parts.get(1);
        let name = method.unwrap_or(&path);
        let server_host = request.uri().host();
        let server_port = request.uri().port_u16();

        let span = tracing::info_span!(
            "request_handler",
            otel.kind = ?SpanKind::Client,
            otel.name = name,
            otel.status_code = Empty,

            server.address = server_host,
            server.port = server_port,

            rpc.system = "grpc",
            rpc.service = service,
            rpc.method = method,
            rpc.response.status_code = Empty,
            rpc.request.metadata.messages = Empty,
            rpc.response.metadata.messages = Empty,

            error.type = Empty,
        );

        global::get_text_map_propagator(|propagator| {
            propagator.inject_context(&span.context(), &mut HeaderInjector(request.headers_mut()))
        });

        let clone = self.inner.clone();
        let mut inner = std::mem::replace(&mut self.inner, clone);
        let future_span = span.clone();

        Box::pin(
            async move {
                let response = inner.call(request).await;

                if response.is_err() {
                    future_span.set_status(opentelemetry::trace::Status::error(
                        "gRPC request failed".to_string(),
                    ));
                } else {
                    future_span.set_status(opentelemetry::trace::Status::Ok);
                }

                response
            }
            .instrument(span),
        )
    }
}

#[derive(Clone, Debug, Default)]
pub struct GrpcServerSpanHandler {}

impl GrpcServerSpanHandler {
    pub fn new() -> Self {
        Self::default()
    }
}

impl<B> MakeSpan<B> for GrpcServerSpanHandler {
    fn make_span(&mut self, request: &hyper::Request<B>) -> tracing::Span {
        let headers = request.headers();

        let parent_context = global::get_text_map_propagator(|propagator| {
            propagator.extract(&HeaderExtractor(headers))
        });

        let path = request
            .uri()
            .path()
            .strip_prefix("/")
            .unwrap_or(request.uri().path());

        let parts = path.split('/').collect::<Vec<_>>();
        let service = parts.first().unwrap_or(&"");
        let method = parts.get(1);
        let name = method.unwrap_or(&path);
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
            "grpc_request_handler",
            otel.kind = ?SpanKind::Server,
            otel.name = name,
            otel.status_code = Empty,

            http.user_agent = %user_agent,
            http.x_forwarded_for = ?x_forwarded_for,

            rpc.system = "grpc",
            rpc.service = service,
            rpc.method = method,
            rpc.response.status_code = Empty,
            rpc.request.metadata.messages = Empty,
            rpc.response.metadata.messages = Empty,

            server.address = server_host,
            server.port = server_port,

            client.address = client_address,
            client.port = client_port,

            error.type = Empty,
        );

        if let Err(err) = span.set_parent(parent_context) {
            tracing::warn!("Failed to set parent context for span: {:?}", err);
        }

        span
    }
}

impl<B> OnResponse<B> for GrpcServerSpanHandler {
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

        span.set_attribute("latency_ms", latency.as_millis().to_string());

        if let Some(ref grpc_message) = grpc_message {
            span.set_attribute(
                "rpc.response.metadata.messages",
                format!("{:#?}", vec![&grpc_message]),
            );
        }

        if let Some(grpc_status) = grpc_status {
            if grpc_status != "0" {
                span.set_status(opentelemetry::trace::Status::error(
                    grpc_message.unwrap_or_default(),
                ));
            }

            span.set_attribute("rpc.response.status_code", grpc_status);
        }
    }
}
