use crate::svc_definitions::TAG_SVC_PORT;
use retrom_codegen::retrom::services::tags::v1::tags_service_client::TagsServiceClient;
use retrom_telemetry::grpc::{GrpcClientSpanLayer, GrpcClientSpanService};
use tonic::transport::Channel;
use tower::ServiceBuilder;

pub type CommonTagsServiceClient = TagsServiceClient<GrpcClientSpanService<Channel>>;

pub fn get_tags_svc_client(port: Option<u16>) -> CommonTagsServiceClient {
    let tags_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_SVC_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .or_else(|| {
                std::env::var("RETROM_TAGS_SVC_PORT")
                    .ok()
                    .and_then(|p| p.parse::<u16>().ok())
            })
            .unwrap_or(TAG_SVC_PORT)
    });

    let tags_svc_host = format!("http://localhost:{tags_svc_port}");

    let channel = Channel::from_shared(tags_svc_host.clone())
        .unwrap_or_else(|_| panic!("Failed to create TagsServiceClient with host {tags_svc_host}"))
        .connect_lazy();

    let svc = ServiceBuilder::new()
        .layer(GrpcClientSpanLayer::new())
        .service(channel);

    TagsServiceClient::new(svc)
}
