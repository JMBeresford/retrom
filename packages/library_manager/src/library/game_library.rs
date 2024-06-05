use super::indexer::{DirRepresented, FileRepresented, IndexerError, Result as IndexerResult};
use retrom_codegen::retrom::{
    Game, GameBuilder, GameFile, GameFileBuilder, Platform, PlatformBuilder,
};
use std::{
    fs::DirEntry,
    path::{Path, PathBuf},
};
use tokio;
use tracing::{error, warn};

#[derive(Debug, Clone)]
pub struct GameLibrary {
    pub platforms: Vec<Platform>,
    pub games: Vec<Game>,
    pub game_files: Vec<GameFile>,
}

impl GameLibrary {
    #[tracing::instrument]
    pub async fn from_content_dir(content_dir: &Path) -> IndexerResult<Self> {
        // content_dir with structure like:
        // content_dir -> plaform[] -> game_dir[] -> game_file[]

        if !content_dir.is_dir() {
            return Err(IndexerError::new(
                "Content directory path must point to an existing *directory*".into(),
            ));
        }

        let content_dir_nodes = match content_dir.read_dir() {
            Ok(sub_dirs) => sub_dirs,
            Err(_) => return Err(IndexerError::new("Could not read content directory".into())),
        };

        let platform_dirs: Vec<DirEntry> = content_dir_nodes
            .filter_map(|node| match node {
                Ok(node) => Some(node),
                Err(why) => {
                    warn!("Could not read content directory node: {:?}", why);
                    None
                }
            })
            .filter(|node| node.path().is_dir())
            .collect();

        let platform_builders: Vec<PlatformBuilder> =
            futures::future::join_all(platform_dirs.into_iter().map(|dir| {
                tokio::spawn(async move { PlatformBuilder::from_dir(&dir.path()).await })
            }))
            .await
            .into_iter()
            .filter_map(|builder| match builder {
                Ok(builder) => Some(builder),
                Err(why) => {
                    error!("Could not get platform builder: {:?}", why);
                    None
                }
            })
            .filter_map(|builder| match builder {
                Ok(builder) => Some(builder),
                Err(why) => {
                    error!("Could not get platform builder: {:?}", why);
                    None
                }
            })
            .collect();

        let platforms: Vec<Platform> = platform_builders
            .into_iter()
            .map(|builder| builder.build().expect("Could not build platform"))
            .collect();

        let mut games: Vec<Game> = vec![];
        let mut game_files: Vec<GameFile> = vec![];

        for platform in platforms.iter() {
            let platform_dir_nodes = PathBuf::from(platform.path.to_owned())
                .read_dir()
                .expect("Could not read platform directory");

            let game_dirs: Vec<DirEntry> = platform_dir_nodes
                .filter_map(|node| match node {
                    Ok(node) => Some(node),
                    Err(why) => {
                        error!("Could not read platform directory node: {:?}", why);
                        None
                    }
                })
                .filter(|node| node.path().is_dir())
                .collect();

            let new_game_builders = match GameBuilder::from_dirs(game_dirs).await {
                Ok(builders) => builders,
                Err(why) => {
                    error!("Could not get games from dirs: {:?}", why);
                    return Err(IndexerError::new("Could not get games from dirs".into()));
                }
            };

            new_game_builders.into_iter().for_each(|mut builder| {
                let new_game = builder
                    .platform_id(platform.id.to_string())
                    .build()
                    .expect("Could not build game");

                games.push(new_game);
            });
        }

        for game in games.iter() {
            let game_dir_nodes = PathBuf::from(game.path.to_owned())
                .read_dir()
                .expect("Could not read game directory");

            let game_nodes: Vec<DirEntry> = game_dir_nodes
                .filter_map(|node| match node {
                    Ok(node) => Some(node),
                    Err(why) => {
                        error!("Could not read game directory node: {:?}", why);
                        None
                    }
                })
                .filter(|node| node.path().is_file())
                .collect();

            let new_game_file_builders: Vec<GameFileBuilder> =
                futures::future::join_all((game_nodes).into_iter().map(|node| {
                    tokio::spawn(async move { GameFileBuilder::from_file(&node.path()).await })
                }))
                .await
                .into_iter()
                .filter_map(|res| {
                    res.map_err(|e| error!("Could not join thread: {:?}", e))
                        .ok()
                })
                .filter_map(|res| {
                    res.map_err(|e| error!("Could not get game file builder: {:?}", e))
                        .ok()
                })
                .collect();

            new_game_file_builders.into_iter().for_each(|mut builder| {
                let new_game_file = builder
                    .game_id(game.id.to_string())
                    .build()
                    .expect("Could not build game file");

                game_files.push(new_game_file);
            });
        }

        let library = GameLibrary {
            platforms,
            games,
            game_files,
        };

        Ok(library)
    }
}
