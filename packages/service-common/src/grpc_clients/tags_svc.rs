use crate::svc_definitions::TAG_SVC_PORT;
use retrom_codegen::retrom::services::tags::v1::tags_service_client::TagsServiceClient;
use tonic::transport::Channel;

pub fn get_tags_svc_client() -> TagsServiceClient<Channel> {
    let tags_svc_port = std::env::var("RETROM_TAGS_SERVICE_PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(TAG_SVC_PORT);

    let tags_svc_host = format!("http://0.0.0.0:{tags_svc_port}");

    let tags_svc_transport = Channel::from_shared(tags_svc_host.clone())
        .unwrap_or_else(|_| panic!("Failed to create TagsServiceClient with host {tags_svc_host}"))
        .connect_lazy();

    TagsServiceClient::new(tags_svc_transport)
}
