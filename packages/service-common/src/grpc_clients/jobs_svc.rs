use crate::svc_definitions::JOB_SVC_PORT;
use retrom_codegen::retrom::services::jobs::v1::job_service_client::JobServiceClient;
use retrom_telemetry::grpc::{GrpcClientSpanLayer, GrpcClientSpanService};
use tonic::transport::Channel;
use tower::ServiceBuilder;

pub type CommonJobServiceClient = JobServiceClient<GrpcClientSpanService<Channel>>;

pub fn get_job_svc_client(port: Option<u16>) -> CommonJobServiceClient {
    let job_svc_port = port.unwrap_or_else(|| {
        std::env::var("RETROM_SVC_PORT")
            .ok()
            .and_then(|p| p.parse::<u16>().ok())
            .or_else(|| {
                std::env::var("RETROM_JOB_SVC_PORT")
                    .ok()
                    .and_then(|p| p.parse::<u16>().ok())
            })
            .unwrap_or(JOB_SVC_PORT)
    });

    let job_svc_host = format!("http://localhost:{job_svc_port}");

    let channel = Channel::from_shared(job_svc_host.clone())
        .unwrap_or_else(|_| panic!("Failed to create JobServiceClient with host {job_svc_host}"))
        .connect_lazy();

    let svc = ServiceBuilder::new()
        .layer(GrpcClientSpanLayer::new())
        .service(channel);

    JobServiceClient::new(svc)
}
