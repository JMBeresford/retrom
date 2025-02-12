use std::num::ParseIntError;

use reqwest::header::ToStrError;
use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),
    #[error(transparent)]
    ToStr(#[from] ToStrError),
    #[error(transparent)]
    ParseInt(#[from] ParseIntError),
    #[error(transparent)]
    Tonic(#[from] tonic::Status),
    #[error("No third party data found")]
    ThirdPartyNotFound,
    #[error(transparent)]
    SteamError(#[from] retrom_plugin_steam::Error),
    #[error(transparent)]
    OpenPathError(#[from] tauri_plugin_opener::Error),
    #[error(transparent)]
    ConfigError(#[from] retrom_plugin_config::Error),
    #[error("Cannot migrate installation directory: {0}")]
    MigrationError(String),
    #[error("Internal Error: {0}")]
    InternalError(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
