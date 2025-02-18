mod ignore_patterns {
    use std::path::PathBuf;

    use crate::grpc::library::content_resolver::{game_resolver::GameResolver, ContentResolver};
    use retrom_codegen::retrom::{ContentDirectory, GameFile, IgnorePatterns, StorageType};

    #[test]
    fn ignores_child_string() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir = tempfile::TempDir::with_prefix_in("platform-", &dir).unwrap();
        let _ignore_dir = tempfile::TempDir::with_prefix_in("ignore-", &dir).unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            storage_type: Some(StorageType::MultiFileGame.into()),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["ignore-".into()],
            }),
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory).unwrap();
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
            storage_type: Some(StorageType::MultiFileGame.into()),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec!["bad_string".into()],
            }),
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory).unwrap();
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
    async fn ignores_relative_path() {
        let dir = tempfile::tempdir().unwrap();
        let platform_dir = tempfile::TempDir::with_prefix_in("platform-", &dir).unwrap();
        let _ignore_dir1 = tempfile::TempDir::with_prefix_in("ignore1-", &dir).unwrap();
        let _ignore_dir2 = tempfile::TempDir::with_prefix_in("ignore2-", &dir).unwrap();

        let game_file = tempfile::NamedTempFile::with_prefix_in("game-", &platform_dir).unwrap();
        let _ignore_file =
            tempfile::NamedTempFile::with_prefix_in("ignore-", &platform_dir).unwrap();

        let cdir_relative_path = dir
            .path()
            .file_name()
            .and_then(|ostr| ostr.to_str())
            .unwrap();

        let content_directory = ContentDirectory {
            path: dir.path().to_str().unwrap().to_string(),
            ignore_patterns: Some(IgnorePatterns {
                patterns: vec![
                    "platform-(.+)/ignore-".into(),
                    format!("{cdir_relative_path}/ignore"),
                ],
            }),
            storage_type: Some(StorageType::SingleFileGame.into()),
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory).unwrap();
        let resolved_platforms = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|r| r.mock_resolve())
            .collect::<Vec<_>>();

        assert_eq!(resolved_platforms.len(), 1);
        assert!(resolved_platforms.iter().any(|rp| rp.row.path
            == platform_dir
                .path()
                .canonicalize()
                .ok()
                .and_then(|ref p| p.to_str().map(|s| s.to_string()))
                .unwrap()));

        let error_logger = |why| {
            tracing::warn!("Could not get game resolver: {:#?}", why);
            None::<Vec<GameResolver>>
        };

        let game_resolvers = resolved_platforms
            .iter()
            .filter_map(|pr| pr.get_game_resolvers().map_err(error_logger).ok())
            .flatten()
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
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory).unwrap();

        let resolved_platforms = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|pr| pr.mock_resolve())
            .collect::<Vec<_>>();

        assert_eq!(resolved_platforms.len(), 2);

        let game_resolvers = resolved_platforms
            .iter()
            .flat_map(|pr| pr.get_game_resolvers().unwrap())
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
            ..Default::default()
        };

        let resolver = ContentResolver::from_content_dir(content_directory).unwrap();

        let resolved_platforms = resolver
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .map(|pr| pr.mock_resolve())
            .collect::<Vec<_>>();

        assert_eq!(resolved_platforms.len(), 2);

        let game_resolvers = resolved_platforms
            .iter()
            .flat_map(|pr| pr.get_game_resolvers().unwrap())
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
            .flat_map(|r| r.mock_resolve().unwrap().mock_resolve_files().unwrap())
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

mod library_definitions {
    use std::{path::PathBuf, str::FromStr};

    use crate::grpc::library::content_resolver::{parser::ContentMacro, ContentResolver};
    use retrom_codegen::retrom::{ContentDirectory, CustomLibraryDefinition, StorageType};

    #[test]
    fn single_platform_lib() {
        let platform_dir = tempfile::TempDir::with_prefix("platform-").unwrap();
        let game_file = tempfile::NamedTempFile::with_prefix_in("game-", &platform_dir).unwrap();

        let content_directory = ContentDirectory {
            path: platform_dir
                .path()
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
            storage_type: Some(StorageType::Custom.into()),
            custom_library_definition: Some(CustomLibraryDefinition {
                definition: format!("{}/{}", ContentMacro::Platform, ContentMacro::GameFile),
            }),
            ..Default::default()
        };

        let resolved_games = ContentResolver::from_content_dir(content_directory)
            .unwrap()
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .flat_map(|pr| pr.mock_resolve().get_game_resolvers().unwrap())
            .map(|gr| gr.mock_resolve().unwrap())
            .collect::<Vec<_>>();

        assert_eq!(resolved_games.len(), 1);
        assert_eq!(
            PathBuf::from_str(&resolved_games[0].row.path)
                .unwrap()
                .canonicalize()
                .unwrap(),
            game_file.path().canonicalize().unwrap()
        );

        let multi_game_platform_dir = tempfile::TempDir::with_prefix("platform-").unwrap();
        let game_dir =
            tempfile::TempDir::with_prefix_in("game-", &multi_game_platform_dir).unwrap();
        let game_file = tempfile::NamedTempFile::with_prefix_in("game-", &game_dir).unwrap();
        let game_file2 = tempfile::NamedTempFile::with_prefix_in("game2-", &game_dir).unwrap();

        let content_directory = ContentDirectory {
            path: multi_game_platform_dir
                .path()
                .canonicalize()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
            storage_type: Some(StorageType::Custom.into()),
            custom_library_definition: Some(CustomLibraryDefinition {
                definition: format!("{}/{}", ContentMacro::Platform, ContentMacro::GameDir),
            }),
            ..Default::default()
        };

        let resolved_games = ContentResolver::from_content_dir(content_directory)
            .unwrap()
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .flat_map(|pr| pr.mock_resolve().get_game_resolvers().unwrap())
            .map(|gr| gr.mock_resolve().unwrap())
            .collect::<Vec<_>>();

        let resolved_files = resolved_games
            .iter()
            .flat_map(|rg| rg.mock_resolve_files().unwrap())
            .collect::<Vec<_>>();

        assert_eq!(resolved_games.len(), 1);
        assert_eq!(resolved_files.len(), 2);
        assert!(
            resolved_files
                .iter()
                .any(|gf| gf.path == game_file.path().canonicalize().unwrap().to_str().unwrap())
                && resolved_files.iter().any(
                    |gf| gf.path == game_file2.path().canonicalize().unwrap().to_str().unwrap()
                )
        );
    }

    #[test]
    fn games_as_grandchildren() {
        let library_dir = tempfile::TempDir::new().unwrap();
        let platform_dir = tempfile::TempDir::with_prefix_in("platform-", &library_dir).unwrap();
        let region1_dir = tempfile::TempDir::with_prefix_in("region-", &platform_dir).unwrap();
        let region2_dir = tempfile::TempDir::with_prefix_in("region-", &platform_dir).unwrap();
        let game1_dir = tempfile::TempDir::with_prefix_in("game-", &region1_dir).unwrap();
        let game2_dir = tempfile::TempDir::with_prefix_in("game-", &region2_dir).unwrap();
        let game_file1 = tempfile::NamedTempFile::with_prefix_in("game-", &game1_dir).unwrap();
        let game_file2 = tempfile::NamedTempFile::with_prefix_in("game-", &game2_dir).unwrap();

        let content_directory = ContentDirectory {
            path: library_dir.path().to_str().unwrap().to_string(),
            storage_type: Some(StorageType::Custom.into()),
            custom_library_definition: Some(CustomLibraryDefinition {
                definition: format!(
                    "{}/{}/{}/{}",
                    ContentMacro::Library,
                    ContentMacro::Platform,
                    ContentMacro::Custom("region-".into()),
                    ContentMacro::GameDir
                ),
            }),
            ..Default::default()
        };

        let resolved_games = ContentResolver::from_content_dir(content_directory)
            .unwrap()
            .resolve_platforms()
            .unwrap()
            .into_iter()
            .flat_map(|pr| pr.mock_resolve().get_game_resolvers().unwrap())
            .map(|gr| gr.mock_resolve().unwrap())
            .collect::<Vec<_>>();

        let resolved_files = resolved_games
            .iter()
            .flat_map(|rg| rg.mock_resolve_files().unwrap())
            .collect::<Vec<_>>();

        assert_eq!(resolved_games.len(), 2);
        assert_eq!(resolved_files.len(), 2);
        assert!(
            resolved_files
                .iter()
                .any(|gf| gf.path == game_file1.path().canonicalize().unwrap().to_str().unwrap())
                && resolved_files.iter().any(
                    |gf| gf.path == game_file2.path().canonicalize().unwrap().to_str().unwrap()
                )
        );
    }
}
