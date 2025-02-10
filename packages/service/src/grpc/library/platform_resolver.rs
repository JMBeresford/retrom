use std::{path::PathBuf, sync::Arc};

use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{NewPlatform, Platform, StorageType};
use retrom_db::{schema, Pool};
use tracing::warn;

use super::{
    content_resolver::{ContentResolver, ResolverError, Result},
    game_resolver::GameResolver,
};

#[derive(Debug, Clone)]
pub struct PlatformResolver {
    pub dir: PathBuf,
    pub content_resolver: ContentResolver,
    pub(super) row: Option<Platform>,
}

#[derive(Debug, Clone)]
pub struct ResolvedPlatform {
    pub content_resolver: ContentResolver,
    pub row: Platform,
}

impl TryFrom<PlatformResolver> for ResolvedPlatform {
    type Error = ResolverError;

    fn try_from(resolver: PlatformResolver) -> std::result::Result<Self, Self::Error> {
        let row = resolver.row.ok_or(ResolverError::NoRowFound)?;

        Ok(Self {
            content_resolver: resolver.content_resolver,
            row,
        })
    }
}

impl ResolvedPlatform {
    pub fn get_game_resolvers(&self) -> Vec<GameResolver> {
        let dir = PathBuf::from(&self.row.path);
        let game_dirs = dir.read_dir().unwrap();

        game_dirs
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.path()),
                Err(why) => {
                    warn!("Could not read game directory node: {:?}", why);
                    None
                }
            })
            .filter(|path| {
                let content_dir = &self.content_resolver.content_directory;
                let abs_path = match path.canonicalize() {
                    Ok(p) => p,
                    Err(why) => {
                        warn!("Could not canonicalize path: {:?}", why);
                        return true;
                    }
                };

                let abs_parent = PathBuf::from(&content_dir.path)
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

                match &self.content_resolver.ignore_regex_set {
                    Some(irs) => !irs.is_match(rel_path),
                    None => true,
                }
            })
            .filter(|path| {
                match self
                    .content_resolver
                    .content_directory
                    .storage_type
                    .and_then(|st| StorageType::try_from(st).ok())
                    .unwrap_or(StorageType::MultiFileGame)
                {
                    StorageType::SingleFileGame => path.is_file(),
                    StorageType::MultiFileGame => path.is_dir(),
                }
            })
            .map(|path| GameResolver::new(path, self.clone()))
            .collect()
    }
}

impl PlatformResolver {
    pub fn new(dir: PathBuf, content_resolver: ContentResolver) -> Self {
        Self {
            dir,
            content_resolver,
            row: None,
        }
    }

    #[cfg(test)]
    pub fn mock_resolve(self) -> ResolvedPlatform {
        let path = self.as_insertable().path;

        ResolvedPlatform {
            content_resolver: self.content_resolver,
            row: Platform {
                id: 1,
                path,
                ..Default::default()
            },
        }
    }

    #[tracing::instrument(skip_all)]
    pub async fn resolve(mut self, db_pool: Arc<Pool>) -> Result<ResolvedPlatform> {
        let mut conn = db_pool.get().await.expect("Could not get db connection");
        let insertable = self.as_insertable();

        let row: Option<Platform> = diesel::insert_into(schema::platforms::table)
            .values(&insertable)
            .on_conflict_do_nothing()
            .get_result(&mut conn)
            .await
            .optional()?;

        self.row = match row {
            Some(row) => Some(row),
            None => schema::platforms::table
                .filter(schema::platforms::path.eq(&insertable.path))
                .get_result(&mut conn)
                .await
                .optional()?,
        };

        self.try_into()
    }

    fn as_insertable(&self) -> NewPlatform {
        let path = self
            .dir
            .canonicalize()
            .ok()
            .and_then(|p| p.to_str().map(|s| s.to_string()))
            .expect("Could not resolve platform path");

        NewPlatform {
            path,
            created_at: None,
            updated_at: None,
            deleted_at: None,
            is_deleted: false,
            third_party: false,
        }
    }
}
