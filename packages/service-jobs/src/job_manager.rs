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
                percent_complete: 0.0,
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
                progress.percent_complete = 1.0;
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

    pub async fn update_job(
        &self,
        id: &str,
        percent_complete: Option<f32>,
        status: Option<JobStatus>,
        message: Option<String>,
    ) -> Result<Job> {
        let now = current_timestamp();

        {
            let mut jobs = self.jobs.write().await;
            let job = jobs
                .get_mut(id)
                .ok_or_else(|| JobError::NotFound(id.to_string()))?;

            if let Some(progress) = job.progress.as_mut() {
                if let Some(pct) = percent_complete {
                    progress.percent_complete = pct;
                }
                if let Some(s) = status {
                    progress.status = s.into();
                }
                if let Some(msg) = message {
                    progress.message = msg;
                }
            }

            job.updated_at = Some(now);
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

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn create_job_has_pending_status_and_zero_progress() {
        let manager = JobManager::new();
        let job = manager.create_job("test".into(), "msg".into()).await;

        assert!(!job.id.is_empty());
        assert_eq!(job.name, "test");
        assert!(job.created_at.is_some());
        assert!(job.finished_at.is_none());

        let p = job.progress.unwrap();
        assert_eq!(p.status, JobStatus::Pending as i32);
        assert_eq!(p.percent_complete, 0.0);
        assert_eq!(p.message, "msg");
    }

    #[tokio::test]
    async fn get_job_returns_none_for_unknown_id() {
        let manager = JobManager::new();
        assert!(manager.get_job("nonexistent").await.is_none());
    }

    #[tokio::test]
    async fn get_job_returns_created_job() {
        let manager = JobManager::new();
        let created = manager.create_job("j".into(), "".into()).await;
        let fetched = manager.get_job(&created.id).await.unwrap();
        assert_eq!(fetched.id, created.id);
        assert_eq!(fetched.name, "j");
    }

    #[tokio::test]
    async fn list_jobs_returns_all_with_no_filter() {
        let manager = JobManager::new();
        manager.create_job("a".into(), "".into()).await;
        manager.create_job("b".into(), "".into()).await;
        assert_eq!(manager.list_jobs(None).await.len(), 2);
    }

    #[tokio::test]
    async fn list_jobs_filters_by_status() {
        let manager = JobManager::new();
        let j1 = manager.create_job("a".into(), "".into()).await;
        manager.create_job("b".into(), "".into()).await;
        manager
            .complete_job(&j1.id, false, "done".into())
            .await
            .unwrap();

        assert_eq!(
            manager.list_jobs(Some(JobStatus::Pending)).await.len(),
            1
        );
        assert_eq!(
            manager.list_jobs(Some(JobStatus::Complete)).await.len(),
            1
        );
    }

    #[tokio::test]
    async fn update_job_changes_progress_fields() {
        let manager = JobManager::new();
        let job = manager.create_job("j".into(), "".into()).await;

        let updated = manager
            .update_job(
                &job.id,
                Some(0.5),
                Some(JobStatus::Running),
                Some("halfway".into()),
            )
            .await
            .unwrap();

        let p = updated.progress.unwrap();
        assert_eq!(p.percent_complete, 0.5);
        assert_eq!(p.status, JobStatus::Running as i32);
        assert_eq!(p.message, "halfway");
    }

    #[tokio::test]
    async fn update_job_omitted_fields_retain_values() {
        let manager = JobManager::new();
        let job = manager.create_job("j".into(), "initial".into()).await;

        let updated = manager
            .update_job(&job.id, Some(0.25), None, None)
            .await
            .unwrap();

        let p = updated.progress.unwrap();
        assert_eq!(p.percent_complete, 0.25);
        assert_eq!(p.message, "initial");
        assert_eq!(p.status, JobStatus::Pending as i32);
    }

    #[tokio::test]
    async fn update_job_returns_not_found_for_unknown_id() {
        let manager = JobManager::new();
        let result = manager.update_job("ghost", Some(0.5), None, None).await;
        assert!(matches!(result, Err(JobError::NotFound(_))));
    }

    #[tokio::test]
    async fn complete_job_sets_complete_status_and_full_progress() {
        let manager = JobManager::new();
        let job = manager.create_job("j".into(), "".into()).await;

        let done = manager
            .complete_job(&job.id, false, "all done".into())
            .await
            .unwrap();

        let p = done.progress.unwrap();
        assert_eq!(p.status, JobStatus::Complete as i32);
        assert_eq!(p.percent_complete, 1.0);
        assert_eq!(p.message, "all done");
        assert!(done.finished_at.is_some());
    }

    #[tokio::test]
    async fn complete_job_with_failed_flag_sets_failed_status() {
        let manager = JobManager::new();
        let job = manager.create_job("j".into(), "".into()).await;

        let failed = manager
            .complete_job(&job.id, true, "oops".into())
            .await
            .unwrap();

        assert_eq!(
            failed.progress.unwrap().status,
            JobStatus::Failed as i32
        );
    }

    #[tokio::test]
    async fn complete_job_returns_not_found_for_unknown_id() {
        let manager = JobManager::new();
        let result = manager.complete_job("ghost", false, "".into()).await;
        assert!(matches!(result, Err(JobError::NotFound(_))));
    }

    #[tokio::test]
    async fn subscribe_receives_initial_state_immediately() {
        let manager = JobManager::new();
        let job = manager.create_job("j".into(), "start".into()).await;

        let mut rx = manager.subscribe(job.id.clone());
        let progress = rx.recv().await.unwrap();

        assert_eq!(progress.id, job.id);
        assert_eq!(progress.status, JobStatus::Pending as i32);
    }

    #[tokio::test]
    async fn subscribe_receives_update_and_terminates_on_completion() {
        let manager = JobManager::new();
        let job = manager.create_job("j".into(), "".into()).await;

        let mut rx = manager.subscribe(job.id.clone());

        // Consume the initial Pending state.
        let _ = rx.recv().await.unwrap();

        // Complete the job; the subscriber task should forward the terminal update.
        manager
            .complete_job(&job.id, false, "done".into())
            .await
            .unwrap();

        let mut saw_complete = false;
        loop {
            match rx.recv().await {
                Ok(p) if p.status == JobStatus::Complete as i32 => saw_complete = true,
                Ok(_) => {}
                Err(_) => break,
            }
        }

        assert!(saw_complete, "expected a Complete progress update before channel closed");
    }
}
