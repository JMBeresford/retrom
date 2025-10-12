use opentelemetry::{global, trace::TracerProvider, KeyValue};
use opentelemetry_otlp::OTEL_EXPORTER_OTLP_ENDPOINT;
use opentelemetry_sdk::{
    metrics::{MeterProviderBuilder, PeriodicReader, SdkMeterProvider},
    propagation::TraceContextPropagator,
    resource::{EnvResourceDetector, SdkProvidedResourceDetector, TelemetryResourceDetector},
    trace::{RandomIdGenerator, Sampler, SdkTracerProvider},
    Resource,
};
use opentelemetry_semantic_conventions::attribute::{SERVICE_NAME, SERVICE_VERSION};
use std::{fs::OpenOptions, path::Path};
use tracing_opentelemetry::{MetricsLayer, OpenTelemetryLayer};
use tracing_subscriber::{layer::SubscriberExt, prelude::*, util::SubscriberInitExt};

pub mod grpc;

#[tracing::instrument(skip(log_path))]
pub async fn init_tracing_subscriber<Logfile: AsRef<Path>>(
    telemetry_enabled: bool,
    log_path: Logfile,
) {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let fmt_layer = tracing_subscriber::fmt::layer()
        .with_ansi(true)
        .with_target(true)
        .boxed();

    let mut layers = vec![fmt_layer];

    if telemetry_enabled {
        let tracer_provider = get_tracer_provider();
        let meter_provider = init_meter_provider();
        let tracer = tracer_provider.tracer("main");

        let metrics_layer = MetricsLayer::new(meter_provider).boxed();
        let telemetry_layer = OpenTelemetryLayer::new(tracer).boxed();

        layers.push(metrics_layer);
        layers.push(telemetry_layer);
    }

    let log_file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(log_path)
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
        // .add_directive("tower_http=debug".parse().unwrap())
        .add_directive("axum::rejection=trace".parse().unwrap())
        .add_directive("hyper_util=info".parse().unwrap());

    tracing_subscriber::registry()
        .with(layers)
        .with(env_filter)
        .init();
}

pub fn resource() -> Resource {
    let environment = if cfg!(debug_assertions) {
        "debug"
    } else {
        "release"
    };

    let svc_name =
        std::env::var("SERVICE_NAME").unwrap_or_else(|_| env!("CARGO_PKG_NAME").to_string());

    let svc_version =
        std::env::var("SERVICE_VERSION").unwrap_or_else(|_| env!("CARGO_PKG_VERSION").to_string());

    Resource::builder_empty()
        .with_detectors(&[
            Box::new(SdkProvidedResourceDetector),
            Box::new(EnvResourceDetector::new()),
            Box::new(TelemetryResourceDetector),
        ])
        .with_attributes([
            KeyValue::new(SERVICE_NAME, svc_name),
            KeyValue::new(SERVICE_VERSION, svc_version),
            KeyValue::new("deployment.environment.name", environment),
        ])
        .build()
}

pub fn init_meter_provider() -> SdkMeterProvider {
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

pub fn get_tracer_provider() -> SdkTracerProvider {
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
