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
    pub(super) ignore_regex_set: Option<regex::RegexSet>,
}

impl ContentResolver {
    pub fn from_content_dir(content_directory: ContentDirectory) -> Self {
        let ignore_patterns: Vec<String> = content_directory
            .ignore_patterns
            .as_ref()
            .map(|ip| ip.patterns.clone())
            .unwrap_or_default();

        let ignore_regex_set = match ignore_patterns.len() {
            0 => None,
            _ => regex::RegexSet::new(ignore_patterns).ok(),
        };

        Self {
            content_directory,
            ignore_regex_set,
        }
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
            .filter(|path| {
                let ignore_regex_set = match self.ignore_regex_set.as_ref() {
                    Some(irs) => irs,
                    None => return true,
                };

                let rel_path = match path
                    .strip_prefix(&content_dir_path)
                    .unwrap_or(path)
                    .to_str()
                {
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

#[cfg(test)]
mod tests {
    use super::*;
    use retrom_codegen::retrom::{GameFile, IgnorePatterns, StorageType};

    #[test]
    fn ignores_child_string() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir = tempfile::TempDir::with_prefix_in("platform-", &dir).unwrap();
        let _ignore_dir = tempfile::TempDir::with_prefix_in("ignore-", &dir).unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["ignore-".into()],
            }),
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory);
        let platform_resolvers = resolver.resolve_platforms().unwrap();

        assert_eq!(platform_resolvers.len(), 1);
        assert_eq!(
            platform_resolvers[0].dir.as_path().canonicalize().unwrap(),
            platform_dir.path().canonicalize().unwrap()
        );
    }

    #[test]
    fn ignores_all_children_string() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir1 = tempfile::TempDir::with_prefix_in("platform1-", &dir).unwrap();
        let platform_dir2 = tempfile::TempDir::with_prefix_in("platform2-", &dir).unwrap();
        let _ignore_dir1 = tempfile::TempDir::with_prefix_in("ignore1-bad_string-", &dir).unwrap();
        let _ignore_dir2 = tempfile::TempDir::with_prefix_in("ignore2-bad_string-", &dir).unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["bad_string".into()],
            }),
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory);
        let platform_dirs = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|pr| pr.dir.canonicalize().unwrap())
            .collect::<Vec<_>>();

        assert_eq!(platform_dirs.len(), 2);
        assert!(platform_dirs.contains(&platform_dir1.path().canonicalize().unwrap()));
        assert!(platform_dirs.contains(&platform_dir2.path().canonicalize().unwrap()));
    }

    #[tokio::test]
    async fn ignores_nested_relative_path() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir = tempfile::TempDir::with_prefix_in("platform-", &dir).unwrap();
        let game_file = tempfile::NamedTempFile::with_prefix_in("game-", &platform_dir).unwrap();
        let _ignore_file =
            tempfile::NamedTempFile::with_prefix_in("ignore-", &platform_dir).unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["platform-(.+)/ignore-".into()],
            }),
            storage_type: Some(StorageType::SingleFileGame.into()),
        };

        let resolver = ContentResolver::from_content_dir(content_directory);
        let resolved_platforms = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|r| r.mock_resolve())
            .collect::<Vec<_>>();

        let game_resolvers = resolved_platforms
            .iter()
            .flat_map(|pr| pr.get_game_resolvers())
            .collect::<Vec<_>>();

        assert_eq!(game_resolvers.len(), 1);
        assert_eq!(
            game_resolvers[0].path.canonicalize().unwrap(),
            game_file.path().canonicalize().unwrap()
        );
    }

    #[test]
    fn ignore_list_comprehensive() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir1 = tempfile::TempDir::with_prefix_in("platform1-", &dir).unwrap();
        let platform_dir2 = tempfile::TempDir::with_prefix_in("platform2-", &dir).unwrap();

        let _ignore_dir1 = tempfile::TempDir::with_prefix_in("ignore1-", &dir).unwrap();
        let _ignore_dir2 = tempfile::TempDir::with_prefix_in("ignore2-", &dir).unwrap();
        let _ignore_dir3 =
            tempfile::TempDir::with_prefix_in("other_prefix-ignore3-", &dir).unwrap();

        let game_file1_1 =
            tempfile::NamedTempFile::with_prefix_in("game1-", &platform_dir1).unwrap();
        let game_file1_2 =
            tempfile::NamedTempFile::with_prefix_in("game2-", &platform_dir1).unwrap();
        let game_file2_1 =
            tempfile::NamedTempFile::with_prefix_in("game1-", &platform_dir2).unwrap();
        let game_file2_2 =
            tempfile::NamedTempFile::with_prefix_in("game2-", &platform_dir2).unwrap();
        let _ignore_file1 =
            tempfile::NamedTempFile::with_prefix_in("ignore-", &platform_dir1).unwrap();
        let game_file3_1 =
            tempfile::NamedTempFile::with_prefix_in("game1-", &platform_dir1).unwrap();
        let game_file3_2 =
            tempfile::NamedTempFile::with_prefix_in("game2-", &platform_dir1).unwrap();

        let _ignore_file2 =
            tempfile::NamedTempFile::with_prefix_in(".DS_store", &platform_dir1).unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["ignore".into(), r"\.DS_store".into()],
            }),
            storage_type: Some(StorageType::SingleFileGame.into()),
        };

        let resolver = ContentResolver::from_content_dir(content_directory);

        let resolved_platforms = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|pr| pr.mock_resolve())
            .collect::<Vec<_>>();

        assert_eq!(resolved_platforms.len(), 2);

        let game_resolvers = resolved_platforms
            .iter()
            .flat_map(|pr| pr.get_game_resolvers())
            .collect::<Vec<_>>();

        assert_eq!(game_resolvers.len(), 6);

        let platform_dirs = resolved_platforms
            .into_iter()
            .map(|pr| PathBuf::from(pr.row.path).canonicalize().unwrap())
            .collect::<Vec<_>>();

        assert!(platform_dirs.contains(&platform_dir1.path().canonicalize().unwrap()));
        assert!(platform_dirs.contains(&platform_dir2.path().canonicalize().unwrap()));

        let game_paths = game_resolvers
            .iter()
            .map(|gr| gr.path.canonicalize().unwrap())
            .collect::<Vec<_>>();

        assert!(game_paths.contains(&game_file1_1.path().canonicalize().unwrap()));
        assert!(game_paths.contains(&game_file1_2.path().canonicalize().unwrap()));
        assert!(game_paths.contains(&game_file2_1.path().canonicalize().unwrap()));
        assert!(game_paths.contains(&game_file2_2.path().canonicalize().unwrap()));
        assert!(game_paths.contains(&game_file3_1.path().canonicalize().unwrap()));
        assert!(game_paths.contains(&game_file3_2.path().canonicalize().unwrap()));
    }

    #[test]
    fn ignore_list_comprehensive_multi() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir1 = tempfile::TempDir::with_prefix_in("platform1-", &dir).unwrap();
        let platform_dir2 = tempfile::TempDir::with_prefix_in("platform2-", &dir).unwrap();

        let _ignore_dir1 = tempfile::TempDir::with_prefix_in("ignore1-", &dir).unwrap();
        let _ignore_dir2 = tempfile::TempDir::with_prefix_in("ignore2-", &dir).unwrap();
        let _ignore_dir3 =
            tempfile::TempDir::with_prefix_in("other_prefix-ignore3-", &dir).unwrap();

        let game_dir1_1 = tempfile::TempDir::with_prefix_in("game1-", &platform_dir1).unwrap();
        let game_dir1_2 = tempfile::TempDir::with_prefix_in("game2-", &platform_dir1).unwrap();
        let game_dir2_1 = tempfile::TempDir::with_prefix_in("game1-", &platform_dir2).unwrap();
        let game_dir2_2 = tempfile::TempDir::with_prefix_in("game2-", &platform_dir2).unwrap();
        let _ignore_dir1 = tempfile::TempDir::with_prefix_in("ignore-", &platform_dir1).unwrap();
        let game_dir3_1 = tempfile::TempDir::with_prefix_in("game1-", &platform_dir1).unwrap();
        let game_dir3_2 = tempfile::TempDir::with_prefix_in("game2-", &platform_dir1).unwrap();

        let _ignore_file_0 =
            tempfile::NamedTempFile::with_prefix_in(".DS_store", &platform_dir1).unwrap();

        let game_file1_1 = tempfile::NamedTempFile::with_prefix_in("game1-", &game_dir1_1).unwrap();
        let game_file1_2 = tempfile::NamedTempFile::with_prefix_in("game2-", &game_dir1_2).unwrap();
        let game_file2_1 = tempfile::NamedTempFile::with_prefix_in("game1-", &game_dir2_1).unwrap();
        let game_file2_2 = tempfile::NamedTempFile::with_prefix_in("game2-", &game_dir2_2).unwrap();

        let _ignore_file1 =
            tempfile::NamedTempFile::with_prefix_in("ignore-", &game_dir1_1).unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["ignore".into(), r"\.DS_store".into()],
            }),
            storage_type: Some(StorageType::MultiFileGame.into()),
        };

        let resolver = ContentResolver::from_content_dir(content_directory);

        let resolved_platforms = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|pr| pr.mock_resolve())
            .collect::<Vec<_>>();

        assert_eq!(resolved_platforms.len(), 2);

        let game_resolvers = resolved_platforms
            .iter()
            .flat_map(|pr| pr.get_game_resolvers())
            .collect::<Vec<_>>();

        assert_eq!(game_resolvers.len(), 6);

        let platform_dirs = resolved_platforms
            .into_iter()
            .map(|pr| PathBuf::from(pr.row.path).canonicalize().unwrap())
            .collect::<Vec<_>>();

        assert!(platform_dirs.contains(&platform_dir1.path().canonicalize().unwrap()));
        assert!(platform_dirs.contains(&platform_dir2.path().canonicalize().unwrap()));

        let game_dirs = game_resolvers
            .iter()
            .map(|gr| gr.path.canonicalize().unwrap())
            .collect::<Vec<_>>();

        assert!(game_dirs.contains(&game_dir1_1.path().canonicalize().unwrap()));
        assert!(game_dirs.contains(&game_dir1_2.path().canonicalize().unwrap()));
        assert!(game_dirs.contains(&game_dir2_1.path().canonicalize().unwrap()));
        assert!(game_dirs.contains(&game_dir2_2.path().canonicalize().unwrap()));
        assert!(game_dirs.contains(&game_dir3_1.path().canonicalize().unwrap()));
        assert!(game_dirs.contains(&game_dir3_2.path().canonicalize().unwrap()));

        let game_files: Vec<GameFile> = game_resolvers
            .into_iter()
            .flat_map(|r| r.mock_resolve().mock_resolve_files())
            .collect();

        let game_file_paths = game_files
            .iter()
            .map(|gf| PathBuf::from(&gf.path).canonicalize().unwrap())
            .collect::<Vec<_>>();

        assert_eq!(game_file_paths.len(), 4);

        assert!(game_file_paths.contains(&game_file1_1.path().canonicalize().unwrap()));
        assert!(game_file_paths.contains(&game_file1_2.path().canonicalize().unwrap()));
        assert!(game_file_paths.contains(&game_file2_1.path().canonicalize().unwrap()));
        assert!(game_file_paths.contains(&game_file2_2.path().canonicalize().unwrap()));
    }
}
