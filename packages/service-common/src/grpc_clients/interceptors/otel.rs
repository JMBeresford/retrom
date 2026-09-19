use opentelemetry::{global, propagation::Injector};
use tonic::{Request, Status};
use tracing_opentelemetry::OpenTelemetrySpanExt;

struct MetadataMap<'a>(&'a mut tonic::metadata::MetadataMap);

impl Injector for MetadataMap<'_> {
    /// Set a key and value in the MetadataMap.  Does nothing if the key or value are not valid inputs
    fn set(&mut self, key: &str, value: String) {
        if let Ok(key) = tonic::metadata::MetadataKey::from_bytes(key.as_bytes()) {
            if let Ok(val) = tonic::metadata::MetadataValue::try_from(&value) {
                self.0.insert(key, val);
            }
        }
    }
}

pub fn otel_interceptor(req: Request<()>) -> Result<Request<()>, Status> {
    let span = tracing::Span::current();
    let cx = span.context();
    let mut req = req;

    span.in_scope(|| tracing::info!("Intercepted!"));

    global::get_text_map_propagator(|propagator| {
        propagator.inject_context(&cx, &mut MetadataMap(req.metadata_mut()))
    });

    Ok(req)
}
