use futures::Stream;
use job_manager::JobManager;
use std::{pin::Pin, sync::Arc};
use tokio_stream::wrappers::ReceiverStream;
use tonic::Status;
use tracing::Instrument;

use retrom_codegen::retrom::{
    job_service_server::JobService, GetJobSubscriptionRequest, GetJobSubscriptionResponse,
    GetJobsRequest, GetJobsResponse,
};

pub mod job_manager;

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
    type GetJobsStream = Pin<Box<dyn Stream<Item = Result<GetJobsResponse, Status>> + Send>>;

    #[tracing::instrument(skip_all)]
    async fn get_jobs(
        &self,
        _request: tonic::Request<GetJobsRequest>,
    ) -> Result<tonic::Response<Self::GetJobsStream>, Status> {
        let (tx, rx) = tokio::sync::mpsc::channel(100);

        let job_manager = self.job_manager.clone();
        let mut jobs_rx = job_manager.subscribe_all();
        let stream = ReceiverStream::new(rx);

        tokio::spawn(
            async move {
                while let Ok(jobs) = jobs_rx.recv().await {
                    let _ = tx.send(Ok(GetJobsResponse { jobs })).await;
                }

                tracing::debug!("Jobs stream ended");
            }
            .instrument(tracing::info_span!("get_jobs_stream")),
        );

        Ok(tonic::Response::new(Box::pin(stream) as Self::GetJobsStream))
    }

    type GetJobSubscriptionStream =
        Pin<Box<dyn Stream<Item = Result<GetJobSubscriptionResponse, Status>> + Send>>;

    #[tracing::instrument(skip_all)]
    async fn get_job_subscription(
        &self,
        request: tonic::Request<GetJobSubscriptionRequest>,
    ) -> Result<tonic::Response<Self::GetJobSubscriptionStream>, Status> {
        let (tx, rx) = tokio::sync::mpsc::channel(5);
        let job_id = request.into_inner().job_id;

        let job_manager = self.job_manager.clone();
        let mut jobs_rx = job_manager.subscribe(job_id);
        let stream = ReceiverStream::new(rx);

        tokio::spawn(
            async move {
                while let Ok(job) = jobs_rx.recv().await {
                    let _ = tx
                        .send(Ok(GetJobSubscriptionResponse { job: Some(job) }))
                        .await;
                }

                tracing::debug!("Jobs stream ended");
            }
            .instrument(tracing::info_span!("get_jobs_stream")),
        );

        Ok(tonic::Response::new(
            Box::pin(stream) as Self::GetJobSubscriptionStream
        ))
    }
}
