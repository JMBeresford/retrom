use retrom_codegen::retrom::services::jobs::v1::Job;
use std::{collections::BTreeMap, sync::Arc};
use tokio::sync::{
    broadcast::{self, error::RecvError},
    RwLock,
};

#[derive(Debug, thiserror::Error)]
pub enum JobError {
    #[error("Job not found: {0}")]
    NotFound(String),

    #[error("Failed to send job update notification")]
    SendError(#[from] broadcast::error::SendError<String>),
}

pub type Result<T> = std::result::Result<T, JobError>;

pub struct JobManager {
    pub(super) jobs: Arc<RwLock<BTreeMap<String, Job>>>,
    pub(super) invalidation_channel: broadcast::Sender<String>,
}

impl Default for JobManager {
    fn default() -> Self {
        Self::new()
    }
}

impl JobManager {
    pub fn new() -> Self {
        Self {
            jobs: Arc::new(RwLock::new(BTreeMap::new())),
            invalidation_channel: broadcast::channel(256).0,
        }
    }

    pub fn subscribe(&self, id: String) -> broadcast::Receiver<Job> {
        let (tx, rx) = broadcast::channel(64);
        let mut invalidation_rx = self.invalidation_channel.subscribe();
        let jobs = self.jobs.clone();

        tokio::spawn(async move {
            loop {
                match jobs.read().await.get(&id) {
                    None => break,
                    Some(job) => {
                        if tx.send(job.clone()).is_err() {
                            tracing::debug!("receiver closed for job {id} subscription");
                            break;
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
