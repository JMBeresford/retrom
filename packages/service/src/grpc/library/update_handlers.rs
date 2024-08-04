use std::{
    env,
    os::unix::fs::MetadataExt,
    path::{Path, PathBuf},
};

use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    Game, GameFile, NewGame, NewGameFile, NewPlatform, Platform, UpdateLibraryRequest,
    UpdateLibraryResponse,
};
use retrom_db::{schema, DBConnection};
use tonic::{Request, Status};
use tracing::{error, warn, Level};

use super::LibraryServiceHandlers;

#[tracing::instrument(level = Level::DEBUG, skip_all)]
pub(super) async fn update_library(
    state: &LibraryServiceHandlers,
    request: Request<UpdateLibraryRequest>,
) -> Result<UpdateLibraryResponse, Status> {
    let content_dir = env::var("CONTENT_DIR").unwrap_or("./mock_content".to_string());

    let content_dir_path = Path::new(&content_dir);

    let mut conn = match state.db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::internal(why.to_string())),
    };

    match do_update(&mut conn, content_dir_path, &request.into_inner()).await {
        Ok(response) => Ok(response),
        Err(why) => {
            error!("Failed to update library: {}", why);
            Err(Status::internal(why.to_string()))
        }
    }
}

async fn do_update(
    conn: &mut DBConnection<'_>,
    content_dir_path: &Path,
    _request: &UpdateLibraryRequest,
) -> Result<UpdateLibraryResponse, Status> {
    let mut response = UpdateLibraryResponse {
        platforms_populated: vec![],
        games_populated: vec![],
        game_files_populated: vec![],
    };

    let platform_paths: Vec<PathBuf> = content_dir_path
        .read_dir()?
        .filter_map(|entry| match entry {
            Ok(entry) => Some(entry.path()),
            Err(why) => {
                warn!("Could not read content directory node: {:?}", why);
                None
            }
        })
        .filter(|path| path.is_dir())
        .collect();

    let normalized_paths: Vec<String> = platform_paths
        .iter()
        .filter_map(|path| match path.canonicalize() {
            Ok(path) => path.to_str().map(|p| p.to_string()),
            Err(why) => {
                warn!("Could not normalize path: {:?}", why);
                None
            }
        })
        .collect();

    let new_platforms: Vec<NewPlatform> = normalized_paths
        .iter()
        .map(|path| NewPlatform {
            path: path.to_string(),
            created_at: None,
            updated_at: None,
        })
        .collect();

    let platforms_updated = match diesel::insert_into(schema::platforms::table)
        .values(&new_platforms)
        .on_conflict_do_nothing()
        .get_results::<Platform>(conn)
        .await
        .optional()
    {
        Ok(platforms) => platforms,
        Err(why) => {
            error!("Failed to update platforms: {}", why);
            return Err(Status::internal(why.to_string()));
        }
    };

    if let Some(platforms) = platforms_updated {
        response.platforms_populated.extend(platforms);
    }

    let all_platforms: Vec<Platform> = match schema::platforms::table.load(conn).await {
        Ok(platforms) => platforms,
        Err(why) => {
            error!("Failed to get all platforms: {}", why);
            return Err(Status::internal(why.to_string()));
        }
    };

    for platform in all_platforms.as_slice() {
        let platform_dir = Path::new(&platform.path);

        if !platform_dir.exists() {
            continue;
        }

        let game_paths: Vec<PathBuf> = platform_dir
            .read_dir()?
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.path()),
                Err(why) => {
                    warn!("Could not read platform dir node: {:?}", why);
                    None
                }
            })
            .filter(|path| path.is_dir())
            .collect();

        let normalized_paths: Vec<String> = game_paths
            .iter()
            .filter_map(|path| match path.canonicalize() {
                Ok(path) => path.to_str().map(|p| p.to_string()),
                Err(why) => {
                    warn!("Could not normalize path: {:?}", why);
                    None
                }
            })
            .collect();

        let new_games: Vec<NewGame> = normalized_paths
            .iter()
            .map(|path| NewGame {
                path: path.to_string(),
                platform_id: Some(platform.id),
                created_at: None,
                updated_at: None,
            })
            .collect();

        let games_updated = match diesel::insert_into(schema::games::table)
            .values(&new_games)
            .on_conflict_do_nothing()
            .get_results::<Game>(conn)
            .await
            .optional()
        {
            Ok(games) => games,
            Err(why) => {
                error!("Failed to update games: {}", why);
                return Err(Status::internal(why.to_string()));
            }
        };

        if let Some(games) = games_updated {
            response.games_populated.extend(games);
        }
    }

    let all_games: Vec<Game> = match schema::games::table.load(conn).await {
        Ok(games) => games,
        Err(why) => {
            error!("Failed to get all games: {}", why);
            return Err(Status::internal(why.to_string()));
        }
    };

    for game in all_games.as_slice() {
        let game_dir = Path::new(&game.path);

        if !game_dir.exists() {
            continue;
        }

        let game_file_paths: Vec<PathBuf> = game_dir
            .read_dir()?
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.path()),
                Err(why) => {
                    warn!("Could not read game dir node: {:?}", why);
                    None
                }
            })
            .filter(|path| path.is_file())
            .collect();

        let normalized_paths: Vec<String> = game_file_paths
            .iter()
            .filter_map(|path| match path.canonicalize() {
                Ok(path) => path.to_str().map(|p| p.to_string()),
                Err(why) => {
                    warn!("Could not normalize path: {:?}", why);
                    None
                }
            })
            .collect();

        let new_game_files: Vec<NewGameFile> = normalized_paths
            .iter()
            .map(|path| {
                let byte_size = match Path::new(path).metadata() {
                    Ok(metadata) => metadata.size() as i32,
                    Err(why) => {
                        warn!("Could not get file metadata: {:?}", why);
                        0
                    }
                };

                NewGameFile {
                    path: path.to_string(),
                    game_id: Some(game.id),
                    byte_size,
                    created_at: None,
                    updated_at: None,
                }
            })
            .collect();

        let games_files_updated = match diesel::insert_into(schema::game_files::table)
            .values(&new_game_files)
            .on_conflict_do_nothing()
            .get_results::<GameFile>(conn)
            .await
            .optional()
        {
            Ok(games_files) => games_files,
            Err(why) => {
                error!("Failed to update game files: {}", why);
                return Err(Status::internal(why.to_string()));
            }
        };

        if let Some(game_files) = games_files_updated {
            response.game_files_populated.extend(game_files);
        }
    }

    Ok(response)
}
