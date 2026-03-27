use retrom_codegen::retrom::services::jobs::v1::{Job, JobProgress, JobStatus};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{
    broadcast::{self, error::RecvError},
    RwLock,
};
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum JobError {
    #[error("Job not found: {0}")]
    NotFound(String),
}

pub type Result<T> = std::result::Result<T, JobError>;

pub struct JobManager {
    jobs: Arc<RwLock<HashMap<String, Job>>>,
    invalidation_channel: broadcast::Sender<String>,
}

impl Default for JobManager {
    fn default() -> Self {
        Self::new()
    }
}

impl JobManager {
    pub fn new() -> Self {
        Self {
            jobs: Arc::new(RwLock::new(HashMap::new())),
            invalidation_channel: broadcast::channel(256).0,
        }
    }

    pub async fn create_job(&self, name: String, message: String) -> Job {
        let id = Uuid::new_v4().to_string();
        let now = current_timestamp();

        let job = Job {
            id: id.clone(),
            name,
            progress: Some(JobProgress {
                id: id.clone(),
                status: JobStatus::Pending.into(),
                progress: 0.0,
                message,
            }),
            created_at: Some(now),
            updated_at: Some(now),
            finished_at: None,
        };

        {
            let mut jobs = self.jobs.write().await;
            jobs.insert(id.clone(), job.clone());
        }

        let _ = self.invalidation_channel.send(id);
        job
    }

    pub async fn get_job(&self, id: &str) -> Option<Job> {
        let jobs = self.jobs.read().await;
        jobs.get(id).cloned()
    }

    pub async fn list_jobs(&self, status_filter: Option<JobStatus>) -> Vec<Job> {
        let jobs = self.jobs.read().await;
        let mut result: Vec<Job> = jobs
            .values()
            .filter(|job| match status_filter {
                Some(status) => job
                    .progress
                    .as_ref()
                    .is_some_and(|p| p.status == status as i32),
                None => true,
            })
            .cloned()
            .collect();

        result.sort_by(|a, b| {
            let a_ts = a.created_at.as_ref().map(|t| (t.seconds, t.nanos));
            let b_ts = b.created_at.as_ref().map(|t| (t.seconds, t.nanos));
            b_ts.cmp(&a_ts)
        });

        result
    }

    pub async fn complete_job(&self, id: &str, failed: bool, message: String) -> Result<Job> {
        let now = current_timestamp();
        let status = if failed {
            JobStatus::Failed
        } else {
            JobStatus::Complete
        };

        {
            let mut jobs = self.jobs.write().await;
            let job = jobs
                .get_mut(id)
                .ok_or_else(|| JobError::NotFound(id.to_string()))?;

            if let Some(progress) = job.progress.as_mut() {
                progress.status = status.into();
                progress.progress = 1.0;
                progress.message = message;
            }

            job.updated_at = Some(now);
            job.finished_at = Some(now);
        }

        let job = self
            .get_job(id)
            .await
            .ok_or_else(|| JobError::NotFound(id.to_string()))?;
        let _ = self.invalidation_channel.send(id.to_string());
        Ok(job)
    }

    pub fn subscribe(&self, id: String) -> broadcast::Receiver<JobProgress> {
        let (tx, rx) = broadcast::channel(64);
        let mut invalidation_rx = self.invalidation_channel.subscribe();
        let jobs = self.jobs.clone();

        tokio::spawn(async move {
            loop {
                {
                    let guard = jobs.read().await;
                    match guard.get(&id) {
                        None => break,
                        Some(job) => {
                            let Some(progress) = job.progress.clone() else {
                                break;
                            };

                            let is_terminal = matches!(
                                JobStatus::try_from(progress.status),
                                Ok(JobStatus::Complete) | Ok(JobStatus::Failed)
                            );

                            if tx.send(progress).is_err() {
                                tracing::debug!("WatchJob receiver closed for job {id}");
                                break;
                            }

                            if is_terminal {
                                break;
                            }
                        }
                    }
                }

                loop {
                    match invalidation_rx.recv().await {
                        Ok(updated_id) if updated_id == id => break,
                        Ok(_) => continue,
                        // On lag, break immediately so we re-read the current job state
                        // and avoid missing a terminal update.
                        Err(RecvError::Lagged(_)) => break,
                        Err(RecvError::Closed) => return,
                    }
                }
            }
        });

        rx
    }
}

fn current_timestamp() -> retrom_codegen::timestamp::Timestamp {
    std::time::SystemTime::now().into()
}
