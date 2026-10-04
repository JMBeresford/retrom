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
use regex::Regex;
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

    #[error(transparent)]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, ScanError>;

/// A library to scan, paired with the filesystem roots it maps to.
#[derive(Debug, Clone)]
pub struct LibraryScanTarget {
    pub library_id: String,
    pub structure_definition: String,
    pub root_path: String,
    pub ignore_patterns: Vec<String>,
}

/// Scan a single library: walk each mapped root directory and upsert the discovered entities.
#[tracing::instrument(skip(db_pool))]
pub async fn scan_library_target(db_pool: &DbPool, target: &LibraryScanTarget) -> Result<()> {
    let parser = StructureParser::new(&target.structure_definition)?;
    let ignore_patterns: Vec<Regex> = target
        .ignore_patterns
        .iter()
        .map(|pattern| {
            Regex::new(pattern).map_err(|why| {
                ScanError::Parser(ParserError::Other(format!(
                    "Invalid ignore pattern `{pattern}`: {why}"
                )))
            })
        })
        .collect::<Result<Vec<_>>>()?;

    let platform_depth = parser.platform_depth();
    let game_depth_from_platform = parser.game_depth_from_platform();

    let root = PathBuf::from(&target.root_path);
    let root_canonical = root.canonicalize()?;

    // Patterns are matched against paths relative to the library root's
    // parent so that anchors like `^` and `$` refer to the visible
    // library hierarchy rather than the machine's absolute filesystem.
    let ignore_base = root_canonical
        .parent()
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| root_canonical.clone());

    if is_ignored_path(
        &ignore_patterns,
        &relative_path_str(&root_canonical, &ignore_base),
    ) {
        tracing::debug!(
            root_path = ?root_canonical,
            library_path = &relative_path_str(&root_canonical, &ignore_base),
            ?ignore_patterns,
            "Library root path ignored",
        );

        return Ok(());
    }

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
        let platform_canonical = match platform_dir.canonicalize().ok() {
            Some(path) => path,
            None => continue,
        };
        let platform_path = match platform_canonical.to_str() {
            Some(s) => s.to_string(),
            None => continue,
        };

        if is_ignored_path(
            &ignore_patterns,
            &relative_path_str(&platform_canonical, &ignore_base),
        ) {
            tracing::debug!(
                platform_root_path = ?platform_canonical,
                platform_path = &relative_path_str(&platform_canonical, &ignore_base),
                ?ignore_patterns,
                "Platform root path ignored"
            );
            continue;
        }

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
            if let Err(why) = scan_game_entry(
                db_pool,
                &platform_id,
                &game_entry,
                &ignore_patterns,
                &ignore_base,
            )
            .await
            {
                warn!("Failed to scan game entry {:?}: {}", game_entry, why);
            }
        }
    }

    Ok(())
}

#[tracing::instrument(skip(db_pool))]
async fn scan_game_entry(
    db_pool: &DbPool,
    platform_id: &str,
    game_entry: &Path,
    ignore_patterns: &[Regex],
    ignore_base: &Path,
) -> Result<()> {
    let game_canonical = match game_entry.canonicalize().ok() {
        Some(path) => path,
        None => return Ok(()),
    };
    let game_path = match game_canonical.to_str() {
        Some(s) => s.to_string(),
        None => return Ok(()),
    };

    if is_ignored_path(
        ignore_patterns,
        &relative_path_str(&game_canonical, ignore_base),
    ) {
        tracing::debug!(
            game_root_path = ?game_canonical,
            game_path = &relative_path_str(&game_canonical, ignore_base),
            ?ignore_patterns,
            "Game root path ignored",
        );
        return Ok(());
    }

    upsert_game(db_pool, platform_id, &game_path).await?;

    Ok(())
}

fn is_ignored_path(ignore_patterns: &[Regex], path: &str) -> bool {
    ignore_patterns.iter().any(|pattern| pattern.is_match(path))
}

/// Returns the portion of `path` that is relative to `base`, with all
/// directory separators normalized to `/` for cross-platform consistency.
/// Falls back to the full path string if `path` is not beneath `base`.
fn relative_path_str(path: &Path, base: &Path) -> String {
    path.strip_prefix(base)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

async fn upsert_platform(db_pool: &DbPool, library_id: &str, path: &str) -> Result<String> {
    let file_root_id = get_file_root(db_pool, path).await?;

    let mut select_builder = QueryBuilder::new(
        r#"
            select
                p.id from platforms p
            join files f 
                on f.id = p.file_root_id
            where f.id = 
        "#,
    );

    select_builder.push_bind(&file_root_id);

    let existing: Option<String> = select_builder
        .build_query_scalar()
        .fetch_optional(db_pool)
        .await?;

    let mut tx = db_pool.begin().await?;

    let platform_id = match existing {
        Some(id) => id,
        None => {
            let id = uuid::Uuid::now_v7().to_string();
            let mut insert_platform = QueryBuilder::new(
                r#"
                    insert into platforms (
                        id,
                        library_id,
                        file_root_id,
                        third_party
                    ) values (
                "#,
            );

            let mut separated = insert_platform.separated(", ");
            separated.push_bind(&id);
            separated.push_bind(library_id);
            separated.push_bind(&file_root_id);
            separated.push_bind(false);
            separated.push_unseparated(")");
            insert_platform.build().execute(&mut *tx).await?;

            id
        }
    };

    let title = match PathBuf::from(path)
        .file_name()
        .and_then(|title| title.to_str())
    {
        Some(title) => title.to_string(),
        None => {
            return Err(ScanError::Parser(ParserError::Other(
                "Could not extract platform title from path".to_string(),
            )))
        }
    };

    let mut builder = QueryBuilder::new(
        r#"
            insert into platform_metadata
                (platform_id, provider_id, title)
            values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated
        .push_bind(&platform_id)
        .push_bind(MANUAL_PROVIDER_ID)
        .push_bind(title)
        .push_unseparated(") on conflict do nothing");

    builder.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(platform_id)
}

async fn upsert_game(db_pool: &DbPool, platform_id: &str, path: &str) -> Result<String> {
    let file_root_id = get_file_root(db_pool, path).await?;

    let mut select_builder = QueryBuilder::new(
        r#"
            select
                g.id from games g
            join files f
                on f.id = g.file_root_id
            where f.id =
        "#,
    );

    select_builder.push_bind(&file_root_id);

    let existing: Option<String> = select_builder
        .build_query_scalar()
        .fetch_optional(db_pool)
        .await?;

    let mut tx = db_pool.begin().await?;

    let game_id = match existing {
        Some(id) => id,
        None => {
            let id = uuid::Uuid::now_v7().to_string();

            let mut insert_game = QueryBuilder::new(
                r#"
                    insert into games (
                        id,
                        platform_id,
                        file_root_id,
                        third_party
                    ) values (
                "#,
            );

            let mut separated = insert_game.separated(", ");
            separated.push_bind(&id);
            separated.push_bind(platform_id);
            separated.push_bind(&file_root_id);
            separated.push_bind(false);
            separated.push_unseparated(")");
            insert_game.build().execute(&mut *tx).await?;

            id
        }
    };

    let title = match PathBuf::from(path)
        .file_name()
        .and_then(|title| title.to_str())
    {
        Some(title) => title.to_string(),
        None => {
            return Err(ScanError::Parser(ParserError::Other(
                "Could not extract game title from path".to_string(),
            )))
        }
    };

    let mut builder = QueryBuilder::new(
        r#"
            insert into game_metadata
                (game_id, provider_id, title)
            values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated
        .push_bind(&game_id)
        .push_bind(MANUAL_PROVIDER_ID)
        .push_bind(&title)
        .push_unseparated(") on conflict do nothing");

    builder.build().execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(game_id)
}

async fn get_file_root(db_pool: &DbPool, path: &str) -> Result<String> {
    let mut builder = QueryBuilder::new("select id from files where absolute_path = ");
    builder.push_bind(path);

    let existing: String = builder.build_query_scalar().fetch_one(db_pool).await?;

    Ok(existing)
}
