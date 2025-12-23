use thiserror::Error;

#[derive(Error, Debug)]
pub enum SavesServiceError {
    #[error("Database error: {0}")]
    Database(#[from] diesel::result::Error),
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("Ludusavi error: {0:?}")]
    Ludusavi(ludusavi::prelude::Error),
    #[error("Status error: {0}")]
    TonicStatus(#[from] tonic::Status),
}

impl From<ludusavi::prelude::Error> for SavesServiceError {
    fn from(err: ludusavi::prelude::Error) -> Self {
        SavesServiceError::Ludusavi(err)
    }
}

pub type Result<T> = std::result::Result<T, SavesServiceError>;
