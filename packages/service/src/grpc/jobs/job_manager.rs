use futures::Future;
use retrom_codegen::retrom::{JobProgress, JobStatus};
use std::{
    collections::HashMap,
    hash::{DefaultHasher, Hash, Hasher},
    sync::Arc,
};
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

#[derive(Debug, Clone)]
pub struct JobOptions {
    pub wait_on_jobs: Option<Vec<u64>>,
}

pub(crate) struct JobManager {
    job_progress: Arc<RwLock<HashMap<u64, JobProgress>>>,
    invalidation_channel: broadcast::Sender<u64>,
}

impl JobManager {
    pub fn new() -> Self {
        Self {
            job_progress: Arc::new(RwLock::new(HashMap::new())),
            invalidation_channel: broadcast::channel(100).0,
        }
    }

    fn get_id(&self, name: &str) -> u64 {
        let mut hasher = DefaultHasher::new();
        name.hash(&mut hasher);
        hasher.finish()
    }

    #[tracing::instrument(skip(self, tasks))]
    pub async fn spawn<T>(
        &self,
        name: &str,
        tasks: Vec<impl Future<Output = T> + Send + 'static>,
        opts: Option<JobOptions>,
    ) -> u64
    where
        T: Send + 'static,
    {
        let name = name.to_string();
        let mut join_set = JoinSet::new();
        let total_tasks = tasks.len();
        let id = self.get_id(&name);

        if let Some(job) = self.job_progress.read().await.get(&id) {
            match JobStatus::try_from(job.status) {
                Ok(JobStatus::Idle) | Ok(JobStatus::Running) => {
                    tracing::warn!("Job already running: {:?}", name);
                    return id;
                }
                _ => {}
            }
        }

        let invalidate_sender = self.invalidation_channel.clone();

        let job_progress = self.job_progress.clone();
        {
            let mut job_progress = job_progress.write().await;
            job_progress.insert(
                id,
                JobProgress {
                    name: name.clone(),
                    status: JobStatus::Idle.into(),
                    percent: 0,
                },
            );
        }

        if invalidate_sender.send(id).is_err() {
            tracing::warn!("No recievers for new job: {:?}", name);
        }

        let mut maybe_wait_ids = opts.and_then(|opts| opts.wait_on_jobs).unwrap_or_default();

        {
            let job_progress = job_progress.read().await;
            maybe_wait_ids.retain(|id| {
                let job = match job_progress.get(id) {
                    Some(job) => job,
                    None => return false,
                };

                let status = JobStatus::try_from(job.status);
                status == Ok(JobStatus::Idle) || status == Ok(JobStatus::Running)
            });
        }

        let listeners = maybe_wait_ids
            .iter()
            .map(|id| (*id, self.subscribe(*id)))
            .collect::<Vec<_>>();

        let job_progress = self.job_progress.clone();
        let name2 = name.clone();
        let mut maybe_wait_ids = maybe_wait_ids.clone();

        tokio::spawn(
            async move {
                let mut depend_join_set = JoinSet::new();
                for (id, mut listener) in listeners.into_iter() {
                    depend_join_set.spawn(async move {
                        while let Ok(progress) = listener.recv().await {
                            match JobStatus::try_from(progress.status) {
                                Ok(JobStatus::Success) => break,
                                Ok(JobStatus::Failure) => break,
                                _ => {}
                            }
                        }

                        id
                    });
                }

                while !maybe_wait_ids.is_empty() {
                    let done_id = depend_join_set.join_next().await.unwrap().unwrap();

                    maybe_wait_ids.retain(|id| *id != done_id);
                }

                for task in tasks.into_iter() {
                    join_set.spawn(task);
                }

                {
                    let mut job_progress = job_progress.write().await;
                    if let Some(job) = job_progress.get_mut(&id) {
                        job.status = JobStatus::Running.into();
                    }
                }

                while let Some(res) = join_set.join_next().await {
                    {
                        let mut job_progress = job_progress.write().await;
                        let tasks_completed = total_tasks - join_set.len();
                        let percent = (tasks_completed as f64 / total_tasks as f64 * 100.0) as u32;

                        if let Err(e) = res {
                            tracing::error!("Task failed: {:?}", e);

                            if let Some(job) = job_progress.get_mut(&id) {
                                job.status = JobStatus::Failure.into();
                            }
                        }

                        if let Some(job) = job_progress.get_mut(&id) {
                            job.percent = percent;
                        };

                        tracing::debug!("Job progress written: {:?}", percent);
                    }

                    let _ = invalidate_sender.send(id);
                }

                {
                    let mut job_progress = job_progress.write().await;
                    if let Some(job) = job_progress.get_mut(&id) {
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

                if let Err(why) = invalidate_sender.send(id) {
                    tracing::error!("Invalidation channel closed: {:?}", why);
                }
            }
            .instrument(tracing::info_span!("job_thread")),
        );

        id
    }

    pub fn subscribe(&self, id: u64) -> broadcast::Receiver<JobProgress> {
        let (tx, rx) = broadcast::channel(1);
        let mut invalidation_receiver = self.invalidation_channel.subscribe();

        let job_progress = self.job_progress.clone();
        tokio::spawn(async move {
            loop {
                {
                    let progress = job_progress.read().await;
                    let job = progress.get(&id).cloned();

                    if let Some(job) = job {
                        if tx.send(job).is_err() {
                            tracing::debug!("Job progress reciever closed");
                            break;
                        }
                    }
                }

                while let Ok(updated_id) = invalidation_receiver.recv().await {
                    if updated_id == id {
                        break;
                    }
                }
            }
        });

        rx
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

                    if tx.send(all_progress).is_err() {
                        tracing::debug!("Bulk job progress reciever closed");
                        break;
                    }
                }

                let _ = invalidation_receiver.recv().await;
            }

            tracing::debug!("Invalidation channel closed");
        });

        rx
    }
}
