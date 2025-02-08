use std::fs::OpenOptions;

use opentelemetry::{
    global::{self, ObjectSafeSpan},
    trace::{Tracer, TracerProvider as _},
    KeyValue,
};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{
    metrics::{MeterProviderBuilder, PeriodicReader, SdkMeterProvider},
    trace::{RandomIdGenerator, Sampler, TracerProvider},
    Resource,
};
use opentelemetry_semantic_conventions::{
    attribute::{SERVICE_NAME, SERVICE_VERSION},
    SCHEMA_URL,
};
use tracing::Level;
use tracing_opentelemetry::{MetricsLayer, OpenTelemetryLayer};
use tracing_subscriber::{layer::SubscriberExt, prelude::*, util::SubscriberInitExt};

const NAME: &str = "retrom-service";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_tracing_subscriber();

    #[cfg(not(feature = "embedded_db"))]
    let opts = None;

    #[cfg(feature = "embedded_db")]
    let db_opts = std::env::var("EMBEDDED_DB_OPTS").ok();
    #[cfg(feature = "embedded_db")]
    let opts: Option<&str> = db_opts.as_deref();

    let (server, _port) = retrom_service::get_server(opts).await;

    let tracer = global::tracer(NAME);
    let mut span = tracer.start("service-thread");
    let _ = server.await;
    span.end();

    Ok(())
}

fn init_tracing_subscriber() {
    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "info,".into())
        .add_directive("tokio_postgres=info".parse().unwrap())
        .add_directive("hyper=info".parse().unwrap())
        .add_directive("hyper_util=info".parse().unwrap());

    let fmt_layer = tracing_subscriber::fmt::layer()
        .with_ansi(true)
        .with_target(true)
        .with_filter(env_filter)
        .boxed();

    let mut layers = vec![fmt_layer];

    if cfg!(debug_assertions) {
        let tracer_provider = get_tracer_provider();
        let meter_provider = init_meter_provider();
        let tracer = tracer_provider.tracer("main");

        let filter_layer = tracing_subscriber::filter::LevelFilter::from_level(Level::INFO);

        let metrics_layer = MetricsLayer::new(meter_provider.clone())
            .with_filter(filter_layer)
            .boxed();
        let telemetry_layer = OpenTelemetryLayer::new(tracer)
            .with_filter(filter_layer)
            .boxed();

        layers.push(metrics_layer);
        layers.push(telemetry_layer);
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

    tracing_subscriber::registry().with(layers).init();
}

fn resource() -> Resource {
    Resource::from_schema_url(
        [
            KeyValue::new(SERVICE_NAME, env!("CARGO_PKG_NAME")),
            KeyValue::new(SERVICE_VERSION, env!("CARGO_PKG_VERSION")),
        ],
        SCHEMA_URL,
    )
}

fn init_meter_provider() -> SdkMeterProvider {
    let exporter = opentelemetry_otlp::MetricExporter::builder()
        .with_tonic()
        .with_temporality(opentelemetry_sdk::metrics::Temporality::default())
        .build()
        .unwrap();

    let reader = PeriodicReader::builder(exporter, opentelemetry_sdk::runtime::Tokio)
        .with_interval(std::time::Duration::from_secs(30))
        .build();

    let meter_provider = MeterProviderBuilder::default()
        .with_resource(resource())
        .with_reader(reader)
        .build();

    global::set_meter_provider(meter_provider.clone());

    meter_provider
}

fn get_tracer_provider() -> TracerProvider {
    let exporter = opentelemetry_otlp::SpanExporter::builder()
        .with_tonic()
        .with_endpoint("http://localhost:4317")
        .build()
        .unwrap();

    let tracer_provider = TracerProvider::builder()
        .with_batch_exporter(exporter, opentelemetry_sdk::runtime::Tokio)
        .with_sampler(Sampler::AlwaysOn)
        .with_id_generator(RandomIdGenerator::default())
        .with_max_events_per_span(64)
        .with_max_attributes_per_span(16)
        .with_resource(resource())
        .build();

    global::set_tracer_provider(tracer_provider.clone());

    tracer_provider
}
