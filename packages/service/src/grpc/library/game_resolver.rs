use std::{os::unix::fs::MetadataExt, path::PathBuf, sync::Arc};

use bigdecimal::ToPrimitive;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{Game, GameFile, NewGame, NewGameFile, StorageType};
use retrom_db::{schema, Pool};
use tracing::warn;

use super::{
    content_resolver::{ResolverError, Result},
    platform_resolver::ResolvedPlatform,
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
        let strategy = &self
            .resolved_platform
            .content_resolver
            .content_directory
            .storage_type;

        match strategy {
            StorageType::SingleFileGame => self.resolve_single_files(db_pool).await,
            StorageType::MultiFileGame => self.resolve_multi_files(db_pool).await,
        }
    }

    /*
     * For MultiFile games, i.e. games that are stored in a directory with multiple files
     * within the Platform directory.
     * */
    async fn resolve_multi_files(&self, db_pool: Arc<Pool>) -> Result<Vec<GameFile>> {
        let mut conn = db_pool.get().await.expect("Could not get db connection");
        let path = PathBuf::from(&self.row.path);
        let game_id = Some(self.row.id);

        let dir_nodes = path.read_dir()?.filter_map(|entry| match entry {
            Ok(entry) => Some(entry.path()),
            Err(why) => {
                warn!("Could not read game file node: {:?}", why);
                None
            }
        });

        let new_game_files: Vec<NewGameFile> = dir_nodes
            .map(|p| {
                let byte_size = match p.metadata() {
                    Ok(metadata) => metadata.size().to_i64().unwrap_or(0),
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
            .collect();

        Ok(diesel::insert_into(schema::game_files::table)
            .values(&new_game_files)
            .on_conflict_do_nothing()
            .get_results(&mut conn)
            .await?)
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
            Ok(metadata) => metadata.size().to_i64().unwrap_or(0),
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

    #[tracing::instrument(skip_all)]
    pub async fn resolve(mut self, db_pool: Arc<Pool>) -> Result<ResolvedGame> {
        let mut conn = db_pool.get().await.expect("Could not get db connection");
        let insertable = self.as_insertable();

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

    fn as_insertable(&self) -> NewGame {
        let storage_type = self
            .resolved_platform
            .content_resolver
            .content_directory
            .storage_type;

        let platform_id = Some(self.resolved_platform.row.id);

        let path = self
            .path
            .canonicalize()
            .ok()
            .and_then(|p| p.to_str().map(|s| s.to_string()))
            .expect("Could not resolve game path");

        NewGame {
            path,
            platform_id,
            created_at: None,
            updated_at: None,
            deleted_at: None,
            is_deleted: false,
            storage_type: Some(storage_type.into()),
            ..Default::default()
        }
    }
}
