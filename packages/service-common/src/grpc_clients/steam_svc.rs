use crate::svc_definitions::METADATA_SVC_PORT;
use retrom_codegen::retrom::services::metadata::v1::steam_service_client::SteamServiceClient;
use tonic::transport::Channel;

pub fn get_steam_svc_client() -> SteamServiceClient<Channel> {
    let metadata_svc_port = std::env::var("RETROM_METADATA_SERVICE_PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(METADATA_SVC_PORT);

    let metadata_svc_host = format!("http://0.0.0.0:{metadata_svc_port}");

    let metadata_svc_transport = Channel::from_shared(metadata_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create SteamServiceClient with host {metadata_svc_host}")
        })
        .connect_lazy();

    SteamServiceClient::new(metadata_svc_transport)
}
