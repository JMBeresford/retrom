use crate::svc_definitions::LIBRARY_SVC_PORT;
use retrom_codegen::retrom::services::library::v1::library_service_client::LibraryServiceClient;
use retrom_telemetry::grpc::{GrpcClientSpanLayer, GrpcClientSpanService};
use tonic::transport::Channel;
use tower::ServiceBuilder;

pub type CommonLibraryServiceClient = LibraryServiceClient<GrpcClientSpanService<Channel>>;

pub fn get_library_svc_client(port: Option<u16>) -> CommonLibraryServiceClient {
    let library_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_SVC_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .or_else(|| {
                std::env::var("RETROM_LIBRARY_SVC_PORT")
                    .ok()
                    .and_then(|p| p.parse::<u16>().ok())
            })
            .unwrap_or(LIBRARY_SVC_PORT)
    });

    let library_svc_host = format!("http://localhost:{library_svc_port}");

    let channel = Channel::from_shared(library_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create LibraryServiceClient with host {library_svc_host}")
        })
        .connect_lazy();

    let svc = ServiceBuilder::new()
        .layer(GrpcClientSpanLayer::new())
        .service(channel);

    LibraryServiceClient::new(svc)
}
