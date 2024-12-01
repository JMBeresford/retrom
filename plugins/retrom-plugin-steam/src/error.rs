use serde::{ser::Serializer, Serialize};

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Steam(#[from] steamlocate::Error),

    #[error("Steam app {:?} is not installed", .0)]
    NotInstalled(u32),

    #[error(transparent)]
    OpenError(#[from] tauri_plugin_shell::Error),

    #[error(transparent)]
    NotifyError(#[from] notify::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
