use retrom_codegen::retrom::services::metadata::v1::metadata_service_client::MetadataServiceClient;
use tonic::transport::Channel;

use crate::svc_definitions::METADATA_SVC_PORT;

pub fn get_metadata_svc_client() -> MetadataServiceClient<Channel> {
    let metadata_svc_port = std::env::var("RETROM_METADATA_SERVICE_PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(METADATA_SVC_PORT);

    let metadata_svc_host = format!("http://0.0.0.0:{metadata_svc_port}");

    let metadata_svc_transport = Channel::from_shared(metadata_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create MetadataServiceClient with host {metadata_svc_host}")
        })
        .connect_lazy();

    MetadataServiceClient::new(metadata_svc_transport)
}
