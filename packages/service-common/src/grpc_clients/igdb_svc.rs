use crate::svc_definitions::METADATA_SVC_PORT;
use retrom_codegen::retrom::services::metadata::v1::igdb_service_client::IgdbServiceClient;
use tonic::transport::Channel;

pub fn get_igdb_svc_client() -> IgdbServiceClient<Channel> {
    let metadata_svc_port = std::env::var("RETROM_METADATA_SERVICE_PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(METADATA_SVC_PORT);

    let metadata_svc_host = format!("http://[::1]:{metadata_svc_port}");

    let metadata_svc_transport = Channel::from_shared(metadata_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create IgdbServiceClient with host {metadata_svc_host}")
        })
        .connect_lazy();

    IgdbServiceClient::new(metadata_svc_transport)
}
