use crate::svc_definitions::METADATA_SVC_PORT;
use retrom_codegen::retrom::services::metadata::v1::steam_service_client::SteamServiceClient;
use retrom_telemetry::grpc::{GrpcClientSpanLayer, GrpcClientSpanService};
use tonic::transport::Channel;
use tower::ServiceBuilder;

pub type CommonSteamServiceClient = SteamServiceClient<GrpcClientSpanService<Channel>>;

pub fn get_steam_svc_client(port: Option<u16>) -> CommonSteamServiceClient {
    let metadata_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_SVC_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .or_else(|| {
                std::env::var("RETROM_METADATA_SVC_PORT")
                    .ok()
                    .and_then(|p| p.parse::<u16>().ok())
            })
            .unwrap_or(METADATA_SVC_PORT)
    });

    let metadata_svc_host = format!("http://localhost:{metadata_svc_port}");

    let channel = Channel::from_shared(metadata_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create SteamServiceClient with host {metadata_svc_host}")
        })
        .connect_lazy();

    let svc = ServiceBuilder::new()
        .layer(GrpcClientSpanLayer::new())
        .service(channel);

    SteamServiceClient::new(svc)
}
