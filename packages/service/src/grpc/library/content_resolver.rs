use std::{io, path::PathBuf, str::FromStr};

use tracing::warn;

use crate::config::ContentDirectory;

use super::platform_resolver::PlatformResolver;

#[derive(thiserror::Error, Debug)]
pub enum ResolverError {
    #[error("No row found in DB")]
    NoRowFound,

    #[error("Could not insert new row")]
    InsertError(#[from] diesel::result::Error),

    #[error("Could not read directory")]
    IoError(#[from] io::Error),
}

pub type Result<T> = std::result::Result<T, ResolverError>;

#[derive(Debug, Clone)]
pub struct ContentResolver {
    pub content_directory: ContentDirectory,
}

impl ContentResolver {
    pub fn from_content_dir(content_directory: ContentDirectory) -> Self {
        Self { content_directory }
    }

    pub fn resolve_platforms(&self) -> Vec<PlatformResolver> {
        let content_dir_path = PathBuf::from_str(&self.content_directory.path)
            .expect("Could not resolve platform directory");

        content_dir_path
            .read_dir()
            .expect("Could not read content directory")
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.path()),
                Err(why) => {
                    warn!("Could not read content directory node: {:?}", why);
                    None
                }
            })
            .filter(|path| path.is_dir())
            .map(|dir| PlatformResolver::new(dir, self.clone()))
            .collect()
    }
}
