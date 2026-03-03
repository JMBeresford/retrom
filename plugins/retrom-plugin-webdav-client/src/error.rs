use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("Invalid Configuration: {0}")]
    InvalidConfig(String),
    #[error("Reqwest Error: {0}")]
    Reqwest(#[from] reqwest::Error),
    #[error("URI Parse Error: {0}")]
    UriParse(#[from] http::uri::InvalidUri),
    #[error("URL Parse Error: {0}")]
    UrlParse(#[from] url::ParseError),
    #[error("Header Value Parse Error: {0}")]
    HeaderValue(#[from] http::header::InvalidHeaderValue),
    #[error("Header Name Parse Error: {0}")]
    HeaderName(#[from] http::header::InvalidHeaderName),
    #[error("Invalid Method: {0}")]
    InvalidMethod(#[from] http::method::InvalidMethod),
    #[error("WebDAV XML Error: {0}")]
    WebDAVXml(#[from] webdav_meta::xml::Error),
    #[error("Error: {0}")]
    Other(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
