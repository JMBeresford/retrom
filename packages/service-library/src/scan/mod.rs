//! Filesystem library scanning backed by sqlx.
//!
//! The scan walks each library's mapped root directories according to its
//! `structure_definition` and upserts the discovered platforms, games, and game files —
//! linking them through the relational mapping tables (`platform_root_directories`,
//! `platform_libraries`, `game_root_directories`, `game_platforms`). Entities are created
//! independently of one another and associated afterwards, so no parent id is required up
//! front.

pub mod parser;

use parser::{ParserError, StructureParser};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::MANUAL_PROVIDER_ID;
use sqlx::QueryBuilder;
use std::path::{Path, PathBuf};
use tracing::warn;
use walkdir::WalkDir;

#[derive(Debug, thiserror::Error)]
pub enum ScanError {
    #[error(transparent)]
    Parser(#[from] ParserError),

    #[error(transparent)]
    Db(#[from] sqlx::Error),
}

pub type Result<T> = std::result::Result<T, ScanError>;

/// A library to scan, paired with the filesystem roots it maps to.
#[derive(Debug, Clone)]
pub struct LibraryScanTarget {
    pub library_id: String,
    pub structure_definition: String,
    pub root_paths: Vec<String>,
}

/// Scan a single library: walk each mapped root directory and upsert the discovered entities.
#[tracing::instrument(skip(db_pool))]
pub async fn scan_library_target(db_pool: &DbPool, target: &LibraryScanTarget) -> Result<()> {
    let parser = StructureParser::new(&target.structure_definition)?;
    let platform_depth = parser.platform_depth();
    let game_depth_from_platform = parser.game_depth_from_platform();

    for root_path in &target.root_paths {
        let root = PathBuf::from(root_path);

        let platform_dirs: Vec<PathBuf> = WalkDir::new(&root)
            .min_depth(platform_depth)
            .max_depth(platform_depth)
            .into_iter()
            .filter_map(|entry| match entry {
                Ok(entry) => Some(entry.into_path()),
                Err(why) => {
                    warn!("Could not read directory node: {:?}", why);
                    None
                }
            })
            .filter(|path| path.is_dir())
            .collect();

        for platform_dir in platform_dirs {
            let platform_path = match canonical_string(&platform_dir) {
                Some(path) => path,
                None => continue,
            };

            let platform_id = upsert_platform(db_pool, &target.library_id, &platform_path).await?;

            let game_entries: Vec<PathBuf> = WalkDir::new(&platform_dir)
                .min_depth(game_depth_from_platform)
                .max_depth(game_depth_from_platform)
                .into_iter()
                .filter_map(|entry| match entry {
                    Ok(entry) => Some(entry.into_path()),
                    Err(why) => {
                        warn!("Could not read game node: {:?}", why);
                        None
                    }
                })
                .collect();

            for game_entry in game_entries {
                if let Err(why) = scan_game_entry(db_pool, &platform_id, &game_entry).await {
                    warn!("Failed to scan game entry {:?}: {}", game_entry, why);
                }
            }
        }
    }

    Ok(())
}

#[tracing::instrument(skip(db_pool))]
async fn scan_game_entry(db_pool: &DbPool, platform_id: &str, game_entry: &Path) -> Result<()> {
    let game_path = match canonical_string(game_entry) {
        Some(path) => path,
        None => return Ok(()),
    };

    let game_id = upsert_game(db_pool, platform_id, &game_path).await?;

    if game_entry.is_dir() {
        let walk_files: Vec<PathBuf> = WalkDir::new(game_entry)
            .into_iter()
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.into_path())
            .filter(|path| path.is_file())
            .collect();

        for file in walk_files {
            if let Some(file_path) = canonical_string(&file) {
                let byte_size = file_byte_size(&file);
                insert_game_file(db_pool, &game_id, platform_id, &file_path, byte_size).await?;
            }
        }
    } else {
        let byte_size = file_byte_size(game_entry);
        insert_game_file(db_pool, &game_id, platform_id, &game_path, byte_size).await?;
    }

    Ok(())
}

async fn upsert_platform(db_pool: &DbPool, library_id: &str, path: &str) -> Result<String> {
    let root_directory_id = upsert_root_directory(db_pool, path).await?;

    let mut select_builder = QueryBuilder::new(
        r#"
            select
                p.id from platforms p
            join platform_root_directories prd
                on prd.platform_id = p.id
            join root_directories rd
                on rd.id = prd.root_directory_id
            where rd.path = 
        "#,
    );

    select_builder.push_bind(path);

    let existing: Option<String> = select_builder
        .build_query_scalar()
        .fetch_optional(db_pool)
        .await?;

    let mut tx = db_pool.begin().await?;

    let platform_id = match existing {
        Some(id) => id,
        None => {
            let id = uuid::Uuid::now_v7().to_string();
            let mut insert_platform =
                QueryBuilder::new("insert into platforms (id, is_deleted, third_party) values (");

            let mut separated = insert_platform.separated(", ");
            separated.push_bind(&id);
            separated.push_bind(false);
            separated.push_bind(false);
            separated.push_unseparated(")");
            insert_platform.build().execute(&mut *tx).await?;

            let mut insert_map = QueryBuilder::new(
                "insert into platform_root_directories (platform_id, root_directory_id) values (",
            );

            let mut separated = insert_map.separated(", ");
            separated.push_bind(&id);
            separated.push_bind(&root_directory_id);
            separated.push_unseparated(") on conflict do nothing");
            insert_map.build().execute(&mut *tx).await?;

            id
        }
    };

    let name = match PathBuf::from(path)
        .file_name()
        .and_then(|name| name.to_str())
    {
        Some(name) => name.to_string(),
        None => {
            return Err(ScanError::Parser(ParserError::Other(
                "Could not extract platform name from path".to_string(),
            )))
        }
    };

    let mut builder = QueryBuilder::new(
        r#"
            insert into platform_metadata
                (id, platform_id, provider_id, provider_platform_id, name)
            values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated
        .push_bind(uuid::Uuid::now_v7().to_string())
        .push_bind(&platform_id)
        .push_bind(MANUAL_PROVIDER_ID)
        .push_bind(&platform_id)
        .push_bind(name)
        .push_unseparated(") on conflict do nothing");

    builder.build().execute(&mut *tx).await?;

    let mut link_builder =
        QueryBuilder::new("insert into platform_libraries (platform_id, library_id) values (");

    let mut separated = link_builder.separated(", ");
    separated.push_bind(&platform_id);
    separated.push_bind(library_id);
    separated.push_unseparated(") on conflict do nothing");
    link_builder.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(platform_id)
}

async fn upsert_game(db_pool: &DbPool, platform_id: &str, path: &str) -> Result<String> {
    let root_directory_id = upsert_root_directory(db_pool, path).await?;

    let mut select_builder = QueryBuilder::new(
        "select g.id from games g \
         join game_root_directories grd on grd.game_id = g.id \
         join root_directories rd on rd.id = grd.root_directory_id \
         where rd.path = ",
    );

    select_builder.push_bind(path);
    let existing: Option<String> = select_builder
        .build_query_scalar()
        .fetch_optional(db_pool)
        .await?;

    let mut tx = db_pool.begin().await?;

    let game_id = match existing {
        Some(id) => id,
        None => {
            let id = uuid::Uuid::now_v7().to_string();

            let mut insert_game =
                QueryBuilder::new("insert into games (id, is_deleted, third_party) values (");

            let mut separated = insert_game.separated(", ");
            separated.push_bind(&id);
            separated.push_bind(false);
            separated.push_bind(false);
            separated.push_unseparated(")");
            insert_game.build().execute(&mut *tx).await?;

            let mut insert_map = QueryBuilder::new(
                "insert into game_root_directories (game_id, root_directory_id) values (",
            );

            let mut separated = insert_map.separated(", ");
            separated.push_bind(&id);
            separated.push_bind(&root_directory_id);
            separated.push_unseparated(") on conflict do nothing");
            insert_map.build().execute(&mut *tx).await?;

            id
        }
    };

    let name = match PathBuf::from(path)
        .file_name()
        .and_then(|name| name.to_str())
    {
        Some(name) => name.to_string(),
        None => {
            return Err(ScanError::Parser(ParserError::Other(
                "Could not extract game name from path".to_string(),
            )))
        }
    };

    let mut builder = QueryBuilder::new(
        r#"
            insert into game_metadata
                (id, game_id, provider_id, provider_game_id, name)
            values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated
        .push_bind(uuid::Uuid::now_v7().to_string())
        .push_bind(&game_id)
        .push_bind(MANUAL_PROVIDER_ID)
        .push_bind(&game_id)
        .push_bind(name)
        .push_unseparated(") on conflict do nothing");

    builder.build().execute(&mut *tx).await?;

    let mut link_builder =
        QueryBuilder::new("insert into game_platforms (game_id, platform_id) values (");

    let mut separated = link_builder.separated(", ");
    separated.push_bind(&game_id);
    separated.push_bind(platform_id);
    separated.push_unseparated(") on conflict do nothing");
    link_builder.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(game_id)
}

async fn upsert_root_directory(db_pool: &DbPool, path: &str) -> Result<String> {
    let id = uuid::Uuid::now_v7().to_string();

    let mut insert_builder = QueryBuilder::new("insert into root_directories (id, path) values (");
    let mut separated = insert_builder.separated(", ");
    separated.push_bind(&id);
    separated.push_bind(path);
    separated.push_unseparated(") on conflict do nothing returning id");

    let inserted: Option<String> = insert_builder
        .build_query_scalar()
        .fetch_optional(db_pool)
        .await?;

    if let Some(id) = inserted {
        return Ok(id);
    }

    let mut select_builder = QueryBuilder::new("select id from root_directories where path = ");
    select_builder.push_bind(path);

    let existing: String = select_builder
        .build_query_scalar()
        .fetch_one(db_pool)
        .await?;

    Ok(existing)
}

async fn insert_game_file(
    db_pool: &DbPool,
    game_id: &str,
    platform_id: &str,
    path: &str,
    byte_size: i64,
) -> Result<()> {
    let mut builder = QueryBuilder::new(
        "insert into game_files (id, byte_size, path, game_id, platform_id) values (",
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(byte_size);
    separated.push_bind(path);
    separated.push_bind(game_id);
    separated.push_bind(platform_id);
    separated.push_unseparated(") on conflict do nothing");

    builder.build().execute(db_pool).await?;

    Ok(())
}

fn canonical_string(path: &Path) -> Option<String> {
    match path.canonicalize() {
        Ok(canonical) => canonical.to_str().map(|s| s.to_string()),
        Err(why) => {
            warn!("Could not canonicalize path {:?}: {}", path, why);
            None
        }
    }
}

fn file_byte_size(path: &Path) -> i64 {
    match path.metadata() {
        Ok(metadata) => i64::try_from(metadata.len()).unwrap_or(0),
        Err(why) => {
            warn!("Could not read metadata for {:?}: {}", path, why);
            0
        }
    }
}
