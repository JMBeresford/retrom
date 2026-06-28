use crate::svc_definitions::CONFIG_SVC_PORT;
use retrom_codegen::retrom::services::config::v1::config_service_client::ConfigServiceClient;
use tonic::transport::Channel;

pub fn get_config_svc_client(port: Option<u16>) -> ConfigServiceClient<Channel> {
    let config_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_CONFIG_SERVICE_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .unwrap_or(CONFIG_SVC_PORT)
    });

    let config_svc_host = format!("http://localhost:{config_svc_port}");

    let config_svc_transport = Channel::from_shared(config_svc_host.clone())
        .unwrap_or_else(|_| {
            panic!("Failed to create ConfigServiceClient with host {config_svc_host}")
        })
        .connect_lazy();

    ConfigServiceClient::new(config_svc_transport)
}
