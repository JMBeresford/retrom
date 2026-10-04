use crate::svc_definitions::FILE_SVC_PORT;
use retrom_codegen::retrom::services::files::v1::file_service_client::FileServiceClient;
use retrom_telemetry::grpc::{GrpcClientSpanLayer, GrpcClientSpanService};
use tonic::transport::Channel;
use tower::ServiceBuilder;

pub type CommonFileServiceClient = FileServiceClient<GrpcClientSpanService<Channel>>;

pub fn get_file_svc_client(port: Option<u16>) -> CommonFileServiceClient {
    let file_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_SVC_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .or_else(|| {
                std::env::var("RETROM_FILE_SVC_PORT")
                    .ok()
                    .and_then(|p| p.parse::<u16>().ok())
            })
            .unwrap_or(FILE_SVC_PORT)
    });

    let file_svc_host = format!("http://localhost:{file_svc_port}");

    let channel = Channel::from_shared(file_svc_host.clone())
        .unwrap_or_else(|_| panic!("Failed to create FileServiceClient with host {file_svc_host}"))
        .connect_lazy();

    let svc = ServiceBuilder::new()
        .layer(GrpcClientSpanLayer::new())
        .service(channel);

    FileServiceClient::new(svc)
}
