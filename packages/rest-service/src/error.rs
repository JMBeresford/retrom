#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Error: {0} - {1}")]
    StatusCode(axum::http::StatusCode, String),

    #[error("IoError: {0}")]
    IoError(#[from] std::io::Error),
}
