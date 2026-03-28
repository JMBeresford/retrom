pub mod job_manager;

use std::{pin::Pin, sync::Arc};

use futures::Stream;
use job_manager::JobManager;
use retrom_codegen::retrom::services::jobs::v1::{
    job_service_server::{JobService, JobServiceServer},
    CompleteJobRequest, CompleteJobResponse, CreateJobRequest, CreateJobResponse, GetJobRequest,
    GetJobResponse, JobProgress, JobStatus, ListJobsRequest, ListJobsResponse, UpdateJobRequest,
    UpdateJobResponse, WatchJobRequest,
};
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status};
use tracing::instrument;

pub struct JobServiceHandlers {
    job_manager: Arc<JobManager>,
}

impl JobServiceHandlers {
    pub fn new(job_manager: Arc<JobManager>) -> Self {
        Self { job_manager }
    }
}

#[tonic::async_trait]
impl JobService for JobServiceHandlers {
    #[instrument(skip_all)]
    async fn create_job(
        &self,
        request: Request<CreateJobRequest>,
    ) -> Result<Response<CreateJobResponse>, Status> {
        let inner = request.into_inner();

        if inner.name.is_empty() {
            return Err(Status::invalid_argument("Job name must not be empty"));
        }

        let job = self.job_manager.create_job(inner.name, inner.message).await;
        Ok(Response::new(CreateJobResponse { job: Some(job) }))
    }

    #[instrument(skip_all)]
    async fn get_job(
        &self,
        request: Request<GetJobRequest>,
    ) -> Result<Response<GetJobResponse>, Status> {
        let id = request.into_inner().id;

        let job = self
            .job_manager
            .get_job(&id)
            .await
            .ok_or_else(|| Status::not_found(format!("Job not found: {id}")))?;

        Ok(Response::new(GetJobResponse { job: Some(job) }))
    }

    #[instrument(skip_all)]
    async fn list_jobs(
        &self,
        request: Request<ListJobsRequest>,
    ) -> Result<Response<ListJobsResponse>, Status> {
        let inner = request.into_inner();

        let status_filter = inner
            .status
            .map(|s| {
                JobStatus::try_from(s)
                    .map_err(|_| Status::invalid_argument(format!("Unknown job status: {s}")))
            })
            .transpose()?
            .filter(|s| *s != JobStatus::Unspecified);

        let jobs = self.job_manager.list_jobs(status_filter).await;
        Ok(Response::new(ListJobsResponse { jobs }))
    }

    #[instrument(skip_all)]
    async fn update_job(
        &self,
        request: Request<UpdateJobRequest>,
    ) -> Result<Response<UpdateJobResponse>, Status> {
        let inner = request.into_inner();

        let status = inner
            .status
            .map(|s| {
                JobStatus::try_from(s)
                    .map_err(|_| Status::invalid_argument(format!("Unknown job status: {s}")))
            })
            .transpose()?
            .filter(|s| *s != JobStatus::Unspecified);

        let job = self
            .job_manager
            .update_job(&inner.id, inner.percent_complete, status, inner.message)
            .await
            .map_err(|e| Status::not_found(e.to_string()))?;

        Ok(Response::new(UpdateJobResponse { job: Some(job) }))
    }

    type WatchJobStream = Pin<Box<dyn Stream<Item = Result<JobProgress, Status>> + Send>>;

    #[instrument(skip_all)]
    async fn watch_job(
        &self,
        request: Request<WatchJobRequest>,
    ) -> Result<Response<Self::WatchJobStream>, Status> {
        let id = request.into_inner().id;

        if self.job_manager.get_job(&id).await.is_none() {
            return Err(Status::not_found(format!("Job not found: {id}")));
        }

        let (tx, rx) = tokio::sync::mpsc::channel(64);
        let mut progress_rx = self.job_manager.subscribe(id.clone());
        let stream = ReceiverStream::new(rx);

        tokio::spawn(async move {
            while let Ok(progress) = progress_rx.recv().await {
                if tx.send(Ok(progress)).await.is_err() {
                    tracing::debug!("WatchJob client disconnected for job {id}");
                    break;
                }
            }
        });

        Ok(Response::new(Box::pin(stream) as Self::WatchJobStream))
    }

    #[instrument(skip_all)]
    async fn complete_job(
        &self,
        request: Request<CompleteJobRequest>,
    ) -> Result<Response<CompleteJobResponse>, Status> {
        let inner = request.into_inner();

        let job = self
            .job_manager
            .complete_job(&inner.id, inner.failed, inner.message)
            .await
            .map_err(|e| Status::not_found(e.to_string()))?;

        Ok(Response::new(CompleteJobResponse { job: Some(job) }))
    }
}

/// Build an [`axum::Router`] that serves the [`JobService`] gRPC endpoints.
pub fn jobs_router() -> axum::Router {
    let job_manager = Arc::new(JobManager::new());
    let job_service = JobServiceServer::new(JobServiceHandlers::new(job_manager));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(job_service);

    routes_builder.routes().into_axum_router()
}
