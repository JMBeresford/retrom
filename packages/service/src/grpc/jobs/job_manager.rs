use futures::Future;
use retrom_codegen::retrom::{JobProgress, JobStatus};
use std::{collections::HashMap, sync::Arc};
use tokio::{
    sync::{
        broadcast::{self, error::RecvError},
        RwLock,
    },
    task::JoinSet,
};
use tracing::Instrument;
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum JobError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

type JobId = Uuid;

#[derive(Debug, Clone)]
pub struct JobOptions {
    pub wait_on_jobs: Option<Vec<JobId>>,
}

pub(crate) struct JobManager {
    job_progress: Arc<RwLock<HashMap<JobId, JobProgress>>>,
    invalidation_channel: broadcast::Sender<JobId>,
}

impl JobManager {
    pub fn new() -> Self {
        Self {
            job_progress: Arc::new(RwLock::new(HashMap::new())),
            invalidation_channel: broadcast::channel(100).0,
        }
    }

    #[tracing::instrument(skip(self, tasks))]
    pub async fn spawn<T, E>(
        &self,
        name: &str,
        tasks: Vec<impl Future<Output = std::result::Result<T, E>> + Send + 'static>,
        opts: Option<JobOptions>,
    ) -> JobId
    where
        T: Send + 'static,
        E: Send + 'static + std::fmt::Debug,
    {
        let name = name.to_string();
        let mut join_set = JoinSet::new();
        let total_tasks = tasks.len();
        let id = uuid::Uuid::new_v4();

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
            tracing::debug!("No recievers for new job: {:?}", name);
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

                        match res {
                            Ok(Ok(_)) => {}
                            Ok(Err(e)) => {
                                tracing::error!("Task failed: {:?}", e);

                                if let Some(job) = job_progress.get_mut(&id) {
                                    job.status = JobStatus::Failure.into();
                                }
                            }
                            Err(e) => {
                                tracing::error!("Join failed: {:?}", e);

                                if let Some(job) = job_progress.get_mut(&id) {
                                    job.status = JobStatus::Failure.into();
                                }
                            }
                        }

                        if let Some(job) = job_progress.get_mut(&id) {
                            job.percent = percent;
                        };
                    }

                    if let Err(why) = invalidate_sender.send(id) {
                        tracing::debug!("Invalidation channel closed: {:?}", why);
                    }
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

    pub fn subscribe(&self, id: JobId) -> broadcast::Receiver<JobProgress> {
        let (tx, rx) = broadcast::channel(100);
        let mut invalidation_receiver = self.invalidation_channel.subscribe();

        let job_progress = self.job_progress.clone();
        tokio::spawn(async move {
            loop {
                {
                    let progress = job_progress.read().await;
                    let job = progress.get(&id).cloned();

                    if let Some(job) = job {
                        let status = JobStatus::try_from(job.status);
                        if tx.send(job).is_err() {
                            tracing::debug!("Job progress reciever closed");
                            break;
                        }

                        if status == Ok(JobStatus::Success) || status == Ok(JobStatus::Failure) {
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
        let (tx, rx) = broadcast::channel(100);
        let mut invalidation_receiver = self.invalidation_channel.subscribe();

        let job_progress = self.job_progress.clone();
        tokio::spawn(async move {
            loop {
                {
                    let progress = job_progress.read().await;
                    let all_progress = progress.iter().map(|(_, v)| v.clone()).collect::<Vec<_>>();

                    let no_running_jobs = all_progress
                        .iter()
                        .filter_map(|job| JobStatus::try_from(job.status).ok())
                        .all(|status| status != JobStatus::Running && status != JobStatus::Idle);

                    if tx.send(all_progress).is_err() {
                        tracing::debug!("Bulk job progress reciever closed");
                        break;
                    }

                    if no_running_jobs {
                        break;
                    }
                }

                if let Err(why) = invalidation_receiver.recv().await {
                    if why == RecvError::Closed {
                        tracing::debug!("Invalidation channel closed: {:?}", why);
                    }

                    break;
                }
            }
        });

        rx
    }
}
