use super::indexer::{DirRepresented, FileRepresented, IndexerError, Result as IndexerResult};
use db::models::{
    game::{Game, NewGame, NewGameBuilder},
    game_file::{GameFile, NewGameFile, NewGameFileBuilder},
    platform::{NewPlatform, NewPlatformBuilder, Platform},
};
use serde::{Deserialize, Serialize};
use std::{
    fs::DirEntry,
    path::{Path, PathBuf},
};
use tokio::{self, fs::canonicalize};
use tracing::{error, info, instrument};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GameLibrary {
    pub platforms: Vec<Platform>,
    pub games: Vec<Game>,
    pub game_files: Vec<GameFile>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NewGameLibrary {
    pub new_platforms: Vec<NewPlatform>,
    pub new_games: Vec<NewGame>,
    pub new_game_files: Vec<NewGameFile>,
}

impl NewGameLibrary {
    #[instrument]
    pub async fn from_content_dir(content_dir: &Path) -> IndexerResult<Self> {
        // content_dir with structure like:
        // content_dir -> plaform[] -> game_dir[] -> game_file[]

        info!(
            "Creating new library from content directory: {:?}",
            canonicalize(content_dir).await
        );

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
                    error!("Could not read content directory node: {:?}", why);
                    None
                }
            })
            .filter(|node| node.path().is_dir())
            .collect();

        let new_platform_builders = match NewPlatformBuilder::from_dirs(platform_dirs).await {
            Ok(builders) => builders,
            Err(why) => {
                error!("Could not get platforms from dirs: {:?}", why);
                return Err(IndexerError::new(
                    "Could not get platforms from dirs".into(),
                ));
            }
        };

        let new_platforms: Vec<NewPlatform> = new_platform_builders
            .into_iter()
            .map(|builder| builder.build().expect("Could not build platform"))
            .collect();

        let mut new_games: Vec<NewGame> = vec![];
        let mut new_game_files: Vec<NewGameFile> = vec![];

        for platform in new_platforms.iter() {
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

            let new_game_builders = match NewGameBuilder::from_dirs(game_dirs).await {
                Ok(builders) => builders,
                Err(why) => {
                    error!("Could not get games from dirs: {:?}", why);
                    return Err(IndexerError::new("Could not get games from dirs".into()));
                }
            };

            new_game_builders.into_iter().for_each(|mut builder| {
                let new_game = builder
                    .platform_id(platform.id)
                    .build()
                    .expect("Could not build game");

                new_games.push(new_game);
            });
        }

        for game in new_games.iter() {
            let game_dir_nodes = PathBuf::from(game.path.to_owned())
                .read_dir()
                .expect("Could not read game directory");

            let game_files: Vec<DirEntry> = game_dir_nodes
                .filter_map(|node| match node {
                    Ok(node) => Some(node),
                    Err(why) => {
                        error!("Could not read game directory node: {:?}", why);
                        None
                    }
                })
                .filter(|node| node.path().is_file())
                .collect();

            let new_game_file_builders = match NewGameFileBuilder::from_files(game_files).await {
                Ok(builders) => builders,
                Err(why) => {
                    error!("Could not get game files from dirs: {:?}", why);
                    return Err(IndexerError::new(
                        "Could not get game files from dirs".into(),
                    ));
                }
            };

            new_game_file_builders.into_iter().for_each(|mut builder| {
                let new_game_file = builder
                    .game_id(game.id)
                    .build()
                    .expect("Could not build game file");

                new_game_files.push(new_game_file);
            });
        }

        let library = NewGameLibrary {
            new_platforms,
            new_games,
            new_game_files,
        };

        Ok(library)
    }
}
