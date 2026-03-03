use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, SaveManagerError>;

#[derive(Debug, thiserror::Error)]
pub enum SaveManagerError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("Status error: {0}")]
    Status(#[from] tonic::Status),
    #[error("Invalid URI: {0}")]
    InvalidUri(#[from] http::uri::InvalidUri),
    #[error("WebDAV error: {0}")]
    WebDav(#[from] retrom_plugin_webdav_client::Error),
    #[error("Reqwest error: {0}")]
    Reqwest(#[from] reqwest::Error),
    #[error("JSON serialization/deserialization error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("XML serialization/deserialization error: {0}")]
    Xml(#[from] webdav_meta::xml::Error),
    #[error("XML Element extraction error: {0}")]
    XMLElement(#[from] webdav_meta::xml::ExtractElementError),
    #[error("No cloud save exists for emulator: {0}")]
    NoCloudSave(i32),
    #[error("Prost decoding error: {0}")]
    ProstDecode(#[from] prost::DecodeError),
    #[error("Invalid If-Header: {0}")]
    InvalidIfHeader(#[from] webdav_meta::headers::InvalidIf),
}

impl Serialize for SaveManagerError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
