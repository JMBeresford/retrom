pub mod game_resolver;
mod parser;
pub mod platform_resolver;

#[cfg(test)]
mod tests;

use std::{io, path::PathBuf, str::FromStr};

use parser::{ContentMacro, LibraryDefinitionParser, ParserError};
use platform_resolver::PlatformResolver;
use retrom_codegen::retrom::{ContentDirectory, CustomLibraryDefinition, StorageType};
use tracing::warn;
use walkdir::WalkDir;

#[derive(thiserror::Error, Debug)]
pub enum ResolverError {
    #[error("No row found in DB")]
    NoRowFound,

    #[error("Could not insert new row: {0}")]
    InsertError(#[from] diesel::result::Error),

    #[error("Could not read directory or file: {0}")]
    IoError(#[from] io::Error),

    #[error("Content directory invalid: {0}")]
    ContentDirectoryError(String),

    #[error(transparent)]
    ParserError(#[from] ParserError),
}

pub type Result<T> = std::result::Result<T, ResolverError>;

#[derive(Debug, Clone)]
pub struct ContentResolver {
    pub content_directory: ContentDirectory,
    pub(super) ignore_regex_set: Option<regex::RegexSet>,
    pub(super) library_definition: CustomLibraryDefinition,
}

impl ContentResolver {
    pub fn from_content_dir(content_directory: ContentDirectory) -> Result<Self> {
        let ignore_patterns: Vec<String> = content_directory
            .ignore_patterns
            .as_ref()
            .map(|ip| ip.patterns.clone())
            .unwrap_or_default();

        let ignore_regex_set = match ignore_patterns.len() {
            0 => None,
            _ => regex::RegexSet::new(ignore_patterns).ok(),
        };

        let library_definition = match content_directory
            .storage_type
            .and_then(|st| StorageType::try_from(st).ok())
        {
            Some(StorageType::SingleFileGame) => CustomLibraryDefinition {
                definition: format!(
                    "{}/{}/{}",
                    ContentMacro::Library,
                    ContentMacro::Platform,
                    ContentMacro::GameFile
                ),
            },
            Some(StorageType::MultiFileGame) => CustomLibraryDefinition {
                definition: format!(
                    "{}/{}/{}",
                    ContentMacro::Library,
                    ContentMacro::Platform,
                    ContentMacro::GameDir,
                ),
            },
            Some(StorageType::Custom) => {
                match content_directory.custom_library_definition.as_ref() {
                    Some(cld) => cld.clone(),
                    None => return Err(ResolverError::ContentDirectoryError(
                        "Content directory declared as custom, but no custom definition was found"
                            .into(),
                    )),
                }
            }
            None => {
                return Err(ResolverError::ContentDirectoryError(
                    "Content directory has no storage type".into(),
                ))
            }
        };

        Ok(Self {
            content_directory,
            ignore_regex_set,
            library_definition,
        })
    }

    pub fn resolve_platforms(&self) -> Result<Vec<PlatformResolver>> {
        let content_dir_path =
            PathBuf::from_str(&self.content_directory.path).expect("Invalid path");

        let parser = LibraryDefinitionParser::new(&self.library_definition)?;
        let depth_to_platforms = parser.depth_to_platforms()?;

        let platform_resolvers = WalkDir::new(&content_dir_path)
            .min_depth(depth_to_platforms)
            .max_depth(depth_to_platforms)
            .into_iter()
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.into_path()),
                Err(why) => {
                    warn!("Could not read content directory node: {:?}", why);
                    None
                }
            })
            .filter(|path| path.is_dir())
            .filter(|path| {
                let ignore_regex_set = match self.ignore_regex_set.as_ref() {
                    Some(irs) => irs,
                    None => return true,
                };

                let abs_path = match path.canonicalize() {
                    Ok(p) => p,
                    Err(why) => {
                        warn!("Could not canonicalize path: {:?}", why);
                        return true;
                    }
                };

                let abs_parent = content_dir_path
                    .parent()
                    .and_then(|p| p.canonicalize().ok());

                let rel_path = match abs_parent {
                    Some(parent) => abs_path.strip_prefix(parent).unwrap_or(path),
                    None => path,
                };

                let rel_path = match rel_path.to_str() {
                    Some(rp) => rp,
                    None => return true,
                };

                !ignore_regex_set.is_match(rel_path)
            })
            .map(|dir| PlatformResolver::new(dir, self.clone()))
            .collect();

        Ok(platform_resolvers)
    }
}
