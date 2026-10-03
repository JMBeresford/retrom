use base64::{engine::general_purpose::URL_SAFE, Engine as _};
use serde::{de::DeserializeOwned, Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct PageCursor<T> {
    /// Tracks the SQL row offset index for the pagination sequence
    pub offset: u32,

    /// Tracks the number of rows to return per page in the pagination sequence
    pub page_size: u32,

    /// (Optional) Stores a filter object that is used to ensure that
    /// cursor serialization remains consistent across multiple requests,
    /// even if the underlying data changes.
    pub filter: T,
}

impl<T> PageCursor<T>
where
    T: Serialize + DeserializeOwned,
{
    pub fn deserialize(token: &str) -> Option<Self> {
        if token.is_empty() {
            return None;
        }

        let bytes = URL_SAFE.decode(token).ok()?;
        serde_json::from_slice(&bytes).ok()
    }

    pub fn serialize(&self) -> String {
        let json_bytes = serde_json::to_vec(self).unwrap_or_default();
        URL_SAFE.encode(json_bytes)
    }
}
