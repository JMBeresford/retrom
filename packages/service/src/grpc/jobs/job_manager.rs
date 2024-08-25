use futures::Future;
use retrom_codegen::retrom::{JobProgress, JobStatus};
use std::{collections::HashMap, sync::Arc};
use tokio::{
    sync::{broadcast, RwLock},
    task::JoinSet,
};
use tracing::Instrument;

#[derive(Debug, thiserror::Error)]
pub enum JobError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, JobError>;

pub(crate) struct JobManager {
    job_progress: Arc<RwLock<HashMap<String, JobProgress>>>,
    invalidation_channel: broadcast::Sender<()>,
}

impl JobManager {
    pub fn new() -> Self {
        Self {
            job_progress: Arc::new(RwLock::new(HashMap::new())),
            invalidation_channel: broadcast::channel(100).0,
        }
    }

    #[tracing::instrument(skip(self, tasks))]
    pub async fn spawn<T>(&self, name: &str, tasks: Vec<impl Future<Output = T> + Send + 'static>)
    where
        T: Send + 'static,
    {
        let name = name.to_string();
        let mut join_set = JoinSet::new();
        let total_tasks = tasks.len();

        for task in tasks.into_iter() {
            join_set.spawn(task);
        }

        let invalidate_sender = self.invalidation_channel.clone();

        let job_progress = self.job_progress.clone();
        {
            let mut job_progress = job_progress.write().await;
            job_progress.insert(
                name.clone(),
                JobProgress {
                    name: name.clone(),
                    status: JobStatus::Running.into(),
                    percent: 0,
                },
            );
        }

        if let Err(why) = invalidate_sender.send(()) {
            tracing::error!("Invalidation channel closed: {:?}", why);
        }

        tokio::spawn(
            async move {
                while let Some(res) = join_set.join_next().await {
                    {
                        let mut job_progress = job_progress.write().await;
                        let name = name.clone();
                        let tasks_completed = total_tasks - join_set.len();
                        let percent = (tasks_completed as f64 / total_tasks as f64 * 100.0) as u32;

                        if let Err(e) = res {
                            tracing::error!("Task failed: {:?}", e);

                            if let Some(job) = job_progress.get_mut(&name) {
                                job.status = JobStatus::Failure.into();
                            }
                        }

                        if let Some(job) = job_progress.get_mut(&name) {
                            job.percent = percent;
                        };

                        tracing::debug!("Job progress written: {:?}", percent);
                    }

                    let _ = invalidate_sender.send(());
                }

                {
                    let mut job_progress = job_progress.write().await;
                    if let Some(job) = job_progress.get_mut(&name) {
                        let status = JobStatus::try_from(job.status).unwrap();

                        match status {
                            JobStatus::Failure => {}
                            _ => {
                                job.status = JobStatus::Success.into();
                                job.percent = 100;
                            }
                        }
                    }
                }

                tracing::info!("Job completed: {}", name);
                if let Err(why) = invalidate_sender.send(()) {
                    tracing::error!("Invalidation channel closed: {:?}", why);
                }
            }
            .instrument(tracing::info_span!("job_thread")),
        );
    }

    pub fn subscribe_all(&self) -> broadcast::Receiver<Vec<JobProgress>> {
        let (tx, rx) = broadcast::channel(10);
        let mut invalidation_receiver = self.invalidation_channel.subscribe();

        let job_progress = self.job_progress.clone();
        tokio::spawn(async move {
            loop {
                {
                    let progress = job_progress.read().await;
                    let all_progress = progress.iter().map(|(_, v)| v.clone()).collect::<Vec<_>>();

                    let _ = tx.send(all_progress);
                }

                if let Err(why) = invalidation_receiver.recv().await {
                    tracing::debug!("Invalidation channel closed: {:?}", why);
                    break;
                }
            }
        });

        rx
    }
}
