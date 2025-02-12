use bigdecimal::ToPrimitive;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{Game, GameFile, NewGame, NewGameFile, StorageType};
use retrom_db::{schema, Pool};
use std::{path::PathBuf, sync::Arc};
use tracing::warn;
use walkdir::WalkDir;

use super::{
    parser::LibraryDefinitionParser, platform_resolver::ResolvedPlatform, ResolverError, Result,
};

pub struct GameResolver {
    pub path: PathBuf,
    pub resolved_platform: ResolvedPlatform,
    row: Option<Game>,
}

pub struct ResolvedGame {
    pub resolved_platform: ResolvedPlatform,
    pub row: Game,
}

impl TryFrom<GameResolver> for ResolvedGame {
    type Error = ResolverError;

    fn try_from(resolver: GameResolver) -> std::result::Result<Self, Self::Error> {
        let row = resolver.row.ok_or(ResolverError::NoRowFound)?;
        let resolved_platform = resolver.resolved_platform;

        Ok(Self {
            resolved_platform,
            row,
        })
    }
}

impl ResolvedGame {
    pub async fn resolve_files(&self, db_pool: Arc<Pool>) -> Result<Vec<GameFile>> {
        let parser = LibraryDefinitionParser::new(
            &self.resolved_platform.content_resolver.library_definition,
        )?;

        let strategy = parser.game_storage_type();

        match strategy {
            StorageType::SingleFileGame => self.resolve_single_files(db_pool).await,
            StorageType::MultiFileGame => self.resolve_multi_files(db_pool).await,
            _ => {
                warn!("No storage type found for Game: {:?}", self.row);
                Ok(vec![])
            }
        }
    }

    #[cfg(test)]
    pub fn mock_resolve_files(&self) -> Result<Vec<GameFile>> {
        let parser = LibraryDefinitionParser::new(
            &self.resolved_platform.content_resolver.library_definition,
        )?;

        let strategy = parser.game_storage_type();

        let files = match strategy {
            StorageType::SingleFileGame => vec![GameFile {
                id: 1,
                path: self.row.path.clone(),
                ..Default::default()
            }],
            StorageType::MultiFileGame => self
                .get_new_multi_files()
                .into_iter()
                .enumerate()
                .map(|(i, file)| GameFile {
                    id: i as i32,
                    path: file.path,
                    ..Default::default()
                })
                .collect(),
            _ => vec![],
        };

        Ok(files)
    }

    /*
     * For MultiFile games, i.e. games that are stored in a directory with multiple files
     * within the Platform directory.
     * */
    async fn resolve_multi_files(&self, db_pool: Arc<Pool>) -> Result<Vec<GameFile>> {
        let new_game_files = self.get_new_multi_files();
        let mut conn = db_pool.get().await.expect("Could not get db connection");

        Ok(diesel::insert_into(schema::game_files::table)
            .values(&new_game_files)
            .on_conflict_do_nothing()
            .get_results(&mut conn)
            .await?)
    }

    fn get_new_multi_files(&self) -> Vec<NewGameFile> {
        let path = PathBuf::from(&self.row.path);
        let game_id = Some(self.row.id);
        let ignore_regex_set = &self.resolved_platform.content_resolver.ignore_regex_set;
        let content_dir_path = PathBuf::from(
            &self
                .resolved_platform
                .content_resolver
                .content_directory
                .path,
        )
        .canonicalize()
        .expect("Could not canonicalize content directory path");

        let dir_nodes = WalkDir::new(&path)
            .into_iter()
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                let path = entry.path();
                let abs_path = match path.canonicalize() {
                    Ok(p) => p,
                    Err(why) => {
                        warn!("Could not canonicalize path: {:?}", why);
                        return false;
                    }
                };

                let rel_path = match content_dir_path.parent() {
                    Some(p) => abs_path.strip_prefix(p).unwrap_or(path),
                    None => path,
                };

                let rel_path = match rel_path.to_str() {
                    Some(p) => p,
                    None => return true,
                };

                match ignore_regex_set {
                    Some(irs) => !irs.is_match(rel_path),
                    None => true,
                }
            })
            .filter_map(|entry| match entry.path().is_file() {
                true => Some(entry.path().to_path_buf()),
                false => None,
            });

        dir_nodes
            .map(|p| {
                let byte_size = match p.metadata() {
                    Ok(metadata) => metadata.len().to_i64().unwrap_or(0),
                    Err(why) => {
                        warn!("Could not get file metadata: {:?}", why);
                        0
                    }
                };

                let path = p
                    .canonicalize()
                    .ok()
                    .and_then(|p| p.to_str().map(|s| s.to_string()))
                    .expect("Could not resolve game file path");

                NewGameFile {
                    path,
                    game_id,
                    byte_size,
                    ..Default::default()
                }
            })
            .collect()
    }

    /*
     * For SingleFile games, i.e. games that are stored in a single file within the
     * Platform directory.
     *
     * In these cases, the path of the Game entry in the DB should effectively match
     * that of the GameFile entry.
     * */
    async fn resolve_single_files(&self, db_pool: Arc<Pool>) -> Result<Vec<GameFile>> {
        let mut conn = db_pool.get().await.expect("Could not get db connection");
        let path = PathBuf::from(&self.row.path);
        let game_id = Some(self.row.id);

        let byte_size = match path.metadata() {
            Ok(metadata) => metadata.len().to_i64().unwrap_or(0),
            Err(why) => {
                warn!("Could not get file metadata: {:?}", why);
                0
            }
        };

        let path = path
            .canonicalize()
            .ok()
            .and_then(|p| p.to_str().map(|s| s.to_string()))
            .expect("Could not resolve game path");

        let new_game_files = vec![NewGameFile {
            path,
            game_id,
            byte_size,
            ..Default::default()
        }];

        Ok(diesel::insert_into(schema::game_files::table)
            .values(&new_game_files)
            .on_conflict_do_nothing()
            .get_results(&mut conn)
            .await?)
    }
}

impl GameResolver {
    pub fn new(path: PathBuf, resolved_platform: ResolvedPlatform) -> Self {
        Self {
            path,
            resolved_platform,
            row: None,
        }
    }

    #[cfg(test)]
    pub fn mock_resolve(self) -> Result<ResolvedGame> {
        let path = self.as_insertable()?.path;

        Ok(ResolvedGame {
            resolved_platform: self.resolved_platform,
            row: Game {
                id: 1,
                path,
                ..Default::default()
            },
        })
    }

    #[tracing::instrument(skip_all)]
    pub async fn resolve(mut self, db_pool: Arc<Pool>) -> Result<ResolvedGame> {
        let mut conn = db_pool.get().await.expect("Could not get db connection");
        let insertable = self.as_insertable()?;

        let row: Option<Game> = diesel::insert_into(schema::games::table)
            .values(&insertable)
            .on_conflict_do_nothing()
            .get_result(&mut conn)
            .await
            .optional()?;

        self.row = match row {
            Some(row) => Some(row),
            None => schema::games::table
                .filter(schema::games::path.eq(&insertable.path))
                .get_result(&mut conn)
                .await
                .optional()?,
        };

        self.try_into()
    }

    fn as_insertable(&self) -> Result<NewGame> {
        let parser = LibraryDefinitionParser::new(
            &self.resolved_platform.content_resolver.library_definition,
        )?;

        let storage_type = Some(parser.game_storage_type() as i32);

        let platform_id = Some(self.resolved_platform.row.id);

        let path = self
            .path
            .canonicalize()
            .ok()
            .and_then(|p| p.to_str().map(|s| s.to_string()))
            .expect("Could not resolve game path");

        Ok(NewGame {
            path,
            platform_id,
            created_at: None,
            updated_at: None,
            deleted_at: None,
            is_deleted: false,
            storage_type,
            ..Default::default()
        })
    }
}
