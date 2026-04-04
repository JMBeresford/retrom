use thiserror::Error;

#[derive(Error, Debug)]
pub enum SavesServiceError {
    #[error("Database error: {0}")]
    Database(#[from] diesel::result::Error),
    #[error("Ludusavi error: {0:?}")]
    Ludusavi(ludusavi::prelude::Error),
    #[error("Status error: {0}")]
    TonicStatus(#[from] tonic::Status),
    #[error("Join error: {0}")]
    JoinError(#[from] tokio::task::JoinError),
}

impl From<ludusavi::prelude::Error> for SavesServiceError {
    fn from(err: ludusavi::prelude::Error) -> Self {
        SavesServiceError::Ludusavi(err)
    }
}

pub type Result<T> = std::result::Result<T, SavesServiceError>;
