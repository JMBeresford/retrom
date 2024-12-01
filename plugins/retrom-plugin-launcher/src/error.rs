use serde::{ser::Serializer, Serialize};
use tokio::sync::mpsc::error::SendError;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    Send(#[from] SendError<()>),
    #[error("Cannot launch unininstalled game with id `{0}`")]
    NotInstalled(i32),
    #[error("Cannot find appropriate file for game with id `{0}`")]
    FileNotFound(i32),
    #[error("Cannot find game with id `{0:?}`")]
    GameNotFound(Option<i32>),
    #[error(transparent)]
    Steam(#[from] retrom_plugin_steam::Error),
    #[error(transparent)]
    Tonic(#[from] tonic::Status),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
