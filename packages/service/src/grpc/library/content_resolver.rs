use std::{io, path::PathBuf, str::FromStr};

use super::platform_resolver::PlatformResolver;
use retrom_codegen::retrom::ContentDirectory;
use tracing::warn;

#[derive(thiserror::Error, Debug)]
pub enum ResolverError {
    #[error("No row found in DB")]
    NoRowFound,

    #[error("Could not insert new row: {0}")]
    InsertError(#[from] diesel::result::Error),

    #[error("Could not read directory or file: {0}")]
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

    pub fn resolve_platforms(&self) -> Result<Vec<PlatformResolver>> {
        let content_dir_path =
            PathBuf::from_str(&self.content_directory.path).expect("Invalid path");

        let platform_resolvers = content_dir_path
            .read_dir()?
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.path()),
                Err(why) => {
                    warn!("Could not read content directory node: {:?}", why);
                    None
                }
            })
            .filter(|path| path.is_dir())
            .map(|dir| PlatformResolver::new(dir, self.clone()))
            .collect();

        Ok(platform_resolvers)
    }
}
