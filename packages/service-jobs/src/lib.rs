pub mod job_manager;
pub mod router;

use futures::Stream;
use job_manager::JobManager;
use pbjson_types::Empty;
use retrom_codegen::retrom::services::jobs::v1::{
    job_service_server::JobService, CreateJobRequest, DeleteJobRequest, GetJobRequest, Job,
    JobStatus, ListJobsRequest, ListJobsResponse, UpdateJobRequest, WatchJobRequest,
    WatchJobResponse,
};
use retrom_db::page_cursor::PageCursor;
use serde::{Deserialize, Serialize};
use std::{pin::Pin, sync::Arc, time::SystemTime};
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Request, Response, Status};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct JobQueryFilter {
    parent: Option<String>,
    status: Option<JobStatus>,
}

type JobCursor = PageCursor<JobQueryFilter>;

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
    async fn create_job(
        &self,
        request: Request<CreateJobRequest>,
    ) -> Result<Response<Job>, Status> {
        let request = request.into_inner();

        let job_init = request
            .job
            .ok_or_else(|| Status::invalid_argument("Missing job"))?;

        let name = if let Some(ref name) = request.job_name {
            format!("jobs/{name}")
        } else {
            let id = uuid::Uuid::now_v7().to_string();
            if let Some(ref parent) = &request.parent {
                format!("{parent}/jobs/{id}")
            } else {
                format!("jobs/{id}")
            }
        };

        let job = Job {
            name,
            parent: request.parent,
            display_name: job_init.display_name,
            status: job_init.status,
            percent_complete: job_init.percent_complete,
            message: job_init.message,
            created_at: Some(SystemTime::now().into()),
            updated_at: Some(SystemTime::now().into()),
            finished_at: None,
        };

        {
            let mut jobs = self.job_manager.jobs.write().await;
            if jobs.contains_key(&job.name) {
                return Err(Status::already_exists(format!(
                    "Job already exists: {}",
                    job.name
                )));
            }

            jobs.insert(job.name.clone(), job.clone());
        }

        if let Err(why) = self.job_manager.invalidation_channel.send(job.name.clone()) {
            tracing::debug!("Failed to send job invalidation for {}: {}", job.name, why);
        };

        Ok(Response::new(job))
    }

    async fn get_job(&self, request: Request<GetJobRequest>) -> Result<Response<Job>, Status> {
        let request = request.into_inner();
        match self
            .job_manager
            .jobs
            .read()
            .await
            .get(&request.name)
            .cloned()
        {
            Some(job) => Ok(Response::new(job)),
            None => Err(Status::not_found(format!(
                "Job not found: {}",
                request.name
            ))),
        }
    }

    async fn list_jobs(
        &self,
        request: Request<ListJobsRequest>,
    ) -> Result<Response<ListJobsResponse>, Status> {
        let request = request.into_inner();

        let cursor = match JobCursor::deserialize(request.page_token()) {
            Some(cursor) => cursor,
            None => {
                let parsed_limit = match request.page_size() {
                    0 => 250, // Default page size
                    n if n < 0 => {
                        return Err(Status::invalid_argument("Page size must be non-negative"))
                    }
                    n if n > 1000 => 1000, // Max page size
                    n => n as u32,
                };

                let initial_filter = JobQueryFilter {
                    parent: request.parent,
                    status: request.status.and_then(|s| JobStatus::try_from(s).ok()),
                };

                JobCursor {
                    offset: 0,
                    page_size: parsed_limit,
                    filter: initial_filter,
                }
            }
        };

        let current_filter = cursor.filter.clone();
        let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

        let all_jobs = self.job_manager.jobs.read().await;

        let jobs: Vec<Job> = all_jobs
            .iter()
            .filter(|(_, job)| {
                if let Some(ref parent) = current_filter.parent {
                    if job.parent.as_deref() != Some(parent) {
                        return false;
                    }
                }
                if let Some(ref status) = current_filter.status {
                    let current_status =
                        JobStatus::try_from(job.status).unwrap_or(JobStatus::Unspecified);

                    if &current_status != status {
                        return false;
                    }
                }
                true
            })
            .skip(cursor.offset as usize)
            .take(query_limit as usize)
            .map(|(_, job)| job.clone())
            .collect();

        let next_page_token = if jobs.len() > cursor.page_size as usize {
            let next_cursor = JobCursor {
                offset: cursor.offset + cursor.page_size,
                page_size: cursor.page_size,
                filter: cursor.filter,
            };

            Some(next_cursor.serialize())
        } else {
            None
        };

        Ok(Response::new(ListJobsResponse {
            jobs: jobs.into_iter().take(cursor.page_size as usize).collect(),
            next_page_token,
        }))
    }

    async fn update_job(
        &self,
        request: Request<UpdateJobRequest>,
    ) -> Result<Response<Job>, Status> {
        let request = request.into_inner();
        let updated_job = request
            .job
            .ok_or_else(|| Status::invalid_argument("Missing job"))?;

        let update_mask = request
            .update_mask
            .ok_or_else(|| Status::invalid_argument("Missing update mask"))?;

        let mut job = self
            .get_job(Request::new(GetJobRequest {
                name: updated_job.name.clone(),
            }))
            .await?
            .into_inner();

        if matches!(job.status(), JobStatus::Complete | JobStatus::Failed) {
            return Err(Status::failed_precondition(format!(
                "Cannot update job {} because it is already in a terminal state: {:?}",
                job.name,
                job.status()
            )));
        };

        if update_mask.paths.contains(&"percent_complete".to_string()) {
            job.percent_complete = updated_job.percent_complete;
        }

        if update_mask.paths.contains(&"status".to_string()) {
            job.status = updated_job.status;
        }

        if update_mask.paths.contains(&"message".to_string()) {
            job.message = updated_job.message.clone();
        }

        self.job_manager
            .jobs
            .write()
            .await
            .insert(job.name.clone(), job.clone());

        if let Err(why) = self.job_manager.invalidation_channel.send(job.name.clone()) {
            tracing::debug!("Failed to send job invalidation for {}: {}", job.name, why);
        };

        Ok(Response::new(job))
    }

    async fn delete_job(
        &self,
        request: Request<DeleteJobRequest>,
    ) -> Result<Response<Empty>, Status> {
        let request = request.into_inner();

        let job = self
            .get_job(Request::new(GetJobRequest {
                name: request.name.clone(),
            }))
            .await?
            .into_inner();

        if !matches!(job.status(), JobStatus::Complete | JobStatus::Failed) {
            return Err(Status::failed_precondition(format!(
                "Cannot delete job {} because it is not in a terminal state: {:?}",
                job.name,
                job.status()
            )));
        };

        self.job_manager.jobs.write().await.remove(&request.name);

        Ok(Response::new(Empty {}))
    }

    type WatchJobStream = Pin<Box<dyn Stream<Item = Result<WatchJobResponse, Status>> + Send>>;

    async fn watch_job(
        &self,
        request: Request<WatchJobRequest>,
    ) -> Result<Response<Self::WatchJobStream>, Status> {
        let request = request.into_inner();

        let job = self
            .get_job(Request::new(GetJobRequest {
                name: request.name.clone(),
            }))
            .await?
            .into_inner();

        let (tx, rx) = tokio::sync::mpsc::channel(64);
        let mut progress_rx = self.job_manager.subscribe(job.name);
        let stream = ReceiverStream::new(rx);

        tokio::spawn(async move {
            while let Ok(job) = progress_rx.recv().await {
                if tx
                    .send(Ok(WatchJobResponse { job: Some(job) }))
                    .await
                    .is_err()
                {
                    tracing::debug!("WatchJob client disconnected for job {}", request.name);
                    break;
                }
            }
        });

        Ok(Response::new(Box::pin(stream) as Self::WatchJobStream))
    }
}
