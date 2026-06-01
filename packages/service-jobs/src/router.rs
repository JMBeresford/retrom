use crate::{job_manager::JobManager, JobServiceHandlers};
use retrom_codegen::retrom::services::jobs::v1::job_service_server::JobServiceServer;
use std::sync::Arc;

/// Build an [`axum::Router`] that serves the [`JobService`] gRPC endpoints.
pub fn jobs_router() -> axum::Router {
    let job_manager = Arc::new(JobManager::new());
    let job_service = JobServiceServer::new(JobServiceHandlers::new(job_manager));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(job_service);

    routes_builder.routes().into_axum_router()
}
