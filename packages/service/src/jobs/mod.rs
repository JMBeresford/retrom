use futures::Future;
use tokio::{sync::mpsc, task::JoinHandle};

#[derive(Debug, thiserror::Error)]
pub enum JobError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, JobError>;

enum JobStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

type Percent = u8;

#[derive(Debug)]
struct Job<T> {
    name: String,
    task: T,

    /// the progress of the job in percentage between 0-100
    progress_rx: mpsc::Receiver<Percent>,
}

trait JobHandle {
    fn name(&self) -> String;
    fn cancel(&self) -> Result<()>;
}

impl<T> Job<T>
where
    T: FnMut(),
{
    fn run(&mut self) -> Result<()> {
        (self.task)();
        Ok(())
    }
}

impl<T> JobHandle for Job<T> {
    fn name(&self) -> String {
        self.name.clone()
    }

    fn cancel(&self) -> Result<()> {
        unimplemented!()
    }
}

pub(crate) struct JobManager {
    jobs: Vec<Box<dyn JobHandle>>,
}

impl JobManager {
    pub fn new() -> Self {
        Self { jobs: Vec::new() }
    }

    pub fn add_job<T>(&mut self, job: Job<T>) -> Result<()>
    where
        T: FnMut() + Send + 'static,
    {
        self.jobs.push(Box::new(job));
        Ok(())
    }

    pub fn cancel_job(&mut self, name: &str) -> Result<()> {
        self.jobs.retain(|job| job.name() != name);
        Ok(())
    }
}
