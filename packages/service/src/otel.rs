use std::{fs::OpenOptions, str::FromStr};

use opentelemetry::{
    global,
    trace::{SpanKind, TracerProvider},
    KeyValue,
};
use opentelemetry_http::HeaderExtractor;
use opentelemetry_otlp::OTEL_EXPORTER_OTLP_ENDPOINT;
use opentelemetry_sdk::{
    metrics::{MeterProviderBuilder, PeriodicReader, SdkMeterProvider},
    propagation::TraceContextPropagator,
    resource::{EnvResourceDetector, SdkProvidedResourceDetector, TelemetryResourceDetector},
    trace::{RandomIdGenerator, Sampler, SdkTracerProvider},
    Resource,
};
use opentelemetry_semantic_conventions::attribute::{SERVICE_NAME, SERVICE_VERSION};
use tracing::field::Empty;
use tracing_opentelemetry::{MetricsLayer, OpenTelemetryLayer, OpenTelemetrySpanExt};
use tracing_subscriber::{layer::SubscriberExt, prelude::*, util::SubscriberInitExt};

#[tracing::instrument]
pub async fn init_tracing_subscriber() {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let fmt_layer = tracing_subscriber::fmt::layer()
        .with_ansi(true)
        .with_target(true)
        .boxed();

    let mut layers = vec![fmt_layer];

    if let Ok(config) = crate::config::ServerConfigManager::new() {
        if config
            .get_config()
            .await
            .telemetry
            .is_some_and(|t| t.enabled)
        {
            let tracer_provider = get_tracer_provider();
            let meter_provider = init_meter_provider();
            let tracer = tracer_provider.tracer("main");

            let metrics_layer = MetricsLayer::new(meter_provider).boxed();
            let telemetry_layer = OpenTelemetryLayer::new(tracer).boxed();

            layers.push(metrics_layer);
            layers.push(telemetry_layer);
        }
    }

    let log_file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open("./retrom.log")
        .expect("failed to open log file");

    let file_layer = tracing_subscriber::fmt::layer()
        .json()
        .with_writer(log_file)
        .boxed();

    layers.push(file_layer);

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "info,".into())
        .add_directive("tokio_postgres=info".parse().unwrap())
        .add_directive("hyper=info".parse().unwrap())
        .add_directive("hyper_util=info".parse().unwrap());

    tracing_subscriber::registry()
        .with(layers)
        .with(env_filter)
        .init();
}

fn resource() -> Resource {
    let environment = if cfg!(debug_assertions) {
        "debug"
    } else {
        "release"
    };

    Resource::builder_empty()
        .with_detectors(&[
            Box::new(SdkProvidedResourceDetector),
            Box::new(EnvResourceDetector::new()),
            Box::new(TelemetryResourceDetector),
        ])
        .with_attributes([
            KeyValue::new(SERVICE_NAME, env!("CARGO_PKG_NAME")),
            KeyValue::new(SERVICE_VERSION, env!("CARGO_PKG_VERSION")),
            KeyValue::new("deployment.environment.name", environment),
        ])
        .build()
}

fn init_meter_provider() -> SdkMeterProvider {
    let exporter = opentelemetry_otlp::MetricExporter::builder()
        .with_http()
        .with_temporality(opentelemetry_sdk::metrics::Temporality::default())
        .build()
        .unwrap();

    let reader = PeriodicReader::builder(exporter)
        .with_interval(std::time::Duration::from_secs(30))
        .build();

    let meter_provider = MeterProviderBuilder::default()
        .with_resource(resource())
        .with_reader(reader)
        .build();

    global::set_meter_provider(meter_provider.clone());

    meter_provider
}

fn get_tracer_provider() -> SdkTracerProvider {
    let exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_http()
        .build()
        .unwrap();

    let tracer_provider = SdkTracerProvider::builder()
        .with_batch_exporter(exporter)
        .with_sampler(Sampler::AlwaysOn)
        .with_id_generator(RandomIdGenerator::default())
        .with_max_events_per_span(64)
        .with_max_attributes_per_span(16)
        .with_resource(resource())
        .build();

    global::set_tracer_provider(tracer_provider.clone());

    tracing::info!(
        "OpenTelemetry Tracer Provider initialized: {}",
        OTEL_EXPORTER_OTLP_ENDPOINT
    );

    tracer_provider
}

pub fn span_from_grpc_request(req: &hyper::Request<hyper::Body>) -> tracing::Span {
    // HACK: http crate mismatch in deps, manually re-create headers in (aliased) http crate
    // that is supported by opentelemetry
    let mut headers = http_new::HeaderMap::new();

    for pair in req.headers().iter() {
        if let Ok(key) = http_new::HeaderName::from_str(pair.0.as_ref()) {
            if let Ok(value) = http_new::HeaderValue::from_str(pair.1.to_str().unwrap()) {
                headers.insert(key, value);
            }
        }
    }

    let parent_context = global::get_text_map_propagator(|propagator| {
        propagator.extract(&HeaderExtractor(&headers))
    });

    let name = req
        .uri()
        .path()
        .strip_prefix("/")
        .unwrap_or(req.uri().path());

    let parts = name.split('/').collect::<Vec<_>>();
    let service = parts.first().unwrap_or(&"");
    let method = parts.get(1).unwrap_or(&"");
    let server_host = req.uri().host().unwrap_or("");
    let server_port = req
        .uri()
        .port()
        .map(|p| p.as_str().to_string())
        .unwrap_or_default();

    let user_agent = req
        .headers()
        .get(http::header::USER_AGENT)
        .map_or("", |h| h.to_str().unwrap_or(""));

    let x_forwarded_for: Vec<&str> = req
        .headers()
        .get_all("x-forwarded-for")
        .iter()
        .filter_map(|h| h.to_str().ok())
        .collect();

    let client_host = req
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
