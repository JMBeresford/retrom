use futures::future::join_all;
use pbjson_types::Empty;
use regex::Regex;
use retrom_codegen::retrom::services::library::v1::{
    BatchCreateLibrariesRequest, BatchCreateLibrariesResponse, BatchGetPlatformsRequest,
    CreateLibraryRequest, DeleteLibraryRequest, DeleteMissingEntriesRequest,
    DeleteMissingEntriesResponse, Game, GameFile, GameRow, GetLibraryRequest, GetPlatformRequest,
    Library, LibraryIgnorePatternRow, LibraryRow, ListGameFilesRequest, ListGamesRequest,
    ListLibrariesRequest, ListLibrariesResponse, Platform, PlatformRow, UpdateLibraryRequest,
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use std::{path::PathBuf, str::FromStr};
use tonic::Status;
use tracing::warn;

use crate::{
    game_handlers::{list_game_files, list_games},
    platform_handlers::batch_get_platforms,
};

fn has_no_existing_paths(paths: &[String], kind: &str, id: &str) -> bool {
    !paths
        .iter()
        .any(|path| match PathBuf::from(path).try_exists() {
            Ok(true) => true,
            Ok(false) => false,
            Err(why) => {
                warn!(
                    "Could not verify {} path for cleanup: id={}, path={}, error={}",
                    kind, id, path, why
                );
                true
            }
        })
}

async fn list_platforms_for_cleanup(db_pool: &DbPool) -> Result<Vec<Platform>, Status> {
    let rows: Vec<PlatformRow> = QueryBuilder::new("select * from platforms where third_party = ")
        .push_bind(false)
        .push(" and is_deleted = ")
        .push_bind(false)
        .build_query_as()
        .fetch_all(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if rows.is_empty() {
        return Ok(vec![]);
    }

    let platform_ids = rows
        .iter()
        .map(|row| row.id.clone())
        .collect::<Vec<String>>();

    batch_get_platforms(
        db_pool.clone(),
        BatchGetPlatformsRequest {
            requests: platform_ids
                .into_iter()
                .map(|id| GetPlatformRequest { id })
                .collect(),
        },
    )
    .await
    .map(|response| response.platforms)
}

async fn list_games_for_cleanup(db_pool: &DbPool) -> Result<Vec<Game>, Status> {
    let rows: Vec<GameRow> = QueryBuilder::new("select * from games where third_party = ")
        .push_bind(false)
        .push(" and is_deleted = ")
        .push_bind(false)
        .build_query_as()
        .fetch_all(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if rows.is_empty() {
        return Ok(vec![]);
    }

    let game_ids = rows
        .iter()
        .map(|row| row.id.clone())
        .collect::<Vec<String>>();

    list_games(
        db_pool.clone(),
        ListGamesRequest {
            ids: game_ids,
            ..Default::default()
        },
    )
    .await
    .map(|response| response.games)
}

fn library_row_to_library(row: LibraryRow, path: String, ignore_patterns: Vec<String>) -> Library {
    Library {
        id: row.id,
        name: row.name,
        structure_definition: row.structure_definition,
        created_at: row.created_at,
        updated_at: row.updated_at,
        path,
        ignore_patterns,
    }
}

async fn get_library_path(db_pool: &DbPool, library_id: &str) -> Result<String, Status> {
    let mut builder = QueryBuilder::new(
        "select rd.path from root_directories rd \
         join library_root_directories lrd on lrd.root_directory_id = rd.id \
         where lrd.library_id = ",
    );

    builder.push_bind(library_id);
    builder.push(" order by lrd.created_at asc limit 1");

    let path: String = builder
        .build_query_scalar()
        .fetch_one(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(path)
}

fn validate_library_payload(library: &Library) -> Result<(), Status> {
    if library.name.is_empty() {
        return Err(Status::invalid_argument("Library name must be provided"));
    }

    if library.structure_definition.is_empty() {
        return Err(Status::invalid_argument(
            "Library structure definition must be provided",
        ));
    }

    if library.path.is_empty() {
        return Err(Status::invalid_argument("Library path must be provided"));
    }

    if let Ok(Err(why)) = PathBuf::from_str(&library.path).map(|d| d.canonicalize()) {
        return Err(Status::invalid_argument(format!(
            "Invalid path provided: {}. Error: {}",
            library.path, why
        )));
    };

    for pattern in &library.ignore_patterns {
        Regex::new(pattern).map_err(|why| {
            Status::invalid_argument(format!(
                "Invalid ignore pattern `{pattern}` for library {}: {why}",
                library.name
            ))
        })?;
    }

    Ok(())
}

async fn get_library_ignore_pattern_rows(
    db_pool: &DbPool,
    library_id: &str,
) -> Result<Vec<LibraryIgnorePatternRow>, Status> {
    let mut builder = QueryBuilder::new(
        "select library_id, pattern, created_at, updated_at from library_ignore_patterns where library_id = ",
    );
    builder.push_bind(library_id);
    builder.push(" order by created_at asc, pattern asc");

    builder
        .build_query_as()
        .fetch_all(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

async fn insert_library_ignore_patterns(
    tx: &mut sqlx::Transaction<'_, retrom_db::RetromDB>,
    library_id: &str,
    ignore_patterns: &[String],
) -> Result<(), Status> {
    if ignore_patterns.is_empty() {
        return Ok(());
    }

    let mut builder =
        QueryBuilder::new("insert into library_ignore_patterns (library_id, pattern) ");
    builder.push_values(ignore_patterns, |mut row, pattern| {
        row.push_bind(library_id).push_bind(pattern);
    });
    builder.push(" on conflict do nothing");

    builder
        .build()
        .execute(&mut **tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(())
}

pub async fn delete_missing_entries(
    db_pool: DbPool,
    request: DeleteMissingEntriesRequest,
) -> Result<DeleteMissingEntriesResponse, Status> {
    let platforms = list_platforms_for_cleanup(&db_pool).await?;
    let games = list_games_for_cleanup(&db_pool).await?;
    let game_files = list_game_files(
        db_pool.clone(),
        ListGameFilesRequest {
            include_deleted: Some(false),
            ..Default::default()
        },
    )
    .await
    .map(|res| res.game_files)?;

    let missing_platforms = platforms
        .into_iter()
        .filter(|platform| has_no_existing_paths(&platform.paths, "platform", &platform.id))
        .collect::<Vec<Platform>>();

    let missing_games = games
        .into_iter()
        .filter(|game| has_no_existing_paths(&game.paths, "game", &game.id))
        .collect::<Vec<Game>>();

    let missing_game_files = game_files
        .into_iter()
        .filter(|game_file| {
            let path = PathBuf::from(&game_file.path);
            match path.try_exists() {
                Ok(exists) => !exists,
                Err(why) => {
                    warn!(
                        "Could not verify game file path for cleanup: id={}, path={}, error={}",
                        game_file.id, game_file.path, why
                    );
                    false
                }
            }
        })
        .collect::<Vec<GameFile>>();

    if !request.dry_run {
        let platform_ids = missing_platforms
            .iter()
            .map(|platform| platform.id.clone())
            .collect::<Vec<String>>();
        let game_ids = missing_games
            .iter()
            .map(|game| game.id.clone())
            .collect::<Vec<String>>();
        let game_file_ids = missing_game_files
            .iter()
            .map(|game_file| game_file.id.clone())
            .collect::<Vec<String>>();

        let mut tx = db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        if !game_file_ids.is_empty() {
            let mut builder = QueryBuilder::new("delete from game_files where id in (");
            let mut separated = builder.separated(", ");
            for id in &game_file_ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");

            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }

        if !game_ids.is_empty() {
            let mut builder = QueryBuilder::new("delete from games where id in (");
            let mut separated = builder.separated(", ");
            for id in &game_ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");

            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }

        if !platform_ids.is_empty() {
            let mut builder = QueryBuilder::new("delete from platforms where id in (");
            let mut separated = builder.separated(", ");
            for id in &platform_ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");

            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }

        tx.commit()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    Ok(DeleteMissingEntriesResponse {
        platforms: missing_platforms,
        games: missing_games,
        game_files: missing_game_files,
    })
}

pub async fn get_library(db_pool: DbPool, request: GetLibraryRequest) -> Result<Library, Status> {
    let id = request.id;

    if id.is_empty() {
        return Err(Status::invalid_argument("Library ID must be provided"));
    }

    let mut builder = QueryBuilder::new("select * from libraries where id = ");
    builder.push_bind(&id);
    builder.push(" limit 1");

    let row: LibraryRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let path = get_library_path(&db_pool, &id).await?;
    let ignore_patterns = get_library_ignore_pattern_rows(&db_pool, &id)
        .await?
        .into_iter()
        .map(|row| row.pattern)
        .collect();

    Ok(library_row_to_library(row, path, ignore_patterns))
}

pub async fn list_libraries(
    db_pool: DbPool,
    request: ListLibrariesRequest,
) -> Result<ListLibrariesResponse, Status> {
    let ids = request.ids;

    let mut builder = QueryBuilder::new("select id from libraries");

    if !ids.is_empty() {
        builder.push(" where id in (");
        let mut separated = builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
    }

    let library_ids: Vec<String> = builder
        .build_query_scalar()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let libraries = join_all(library_ids.into_iter().map(|id| {
        let db_pool = db_pool.clone();
        async move { get_library(db_pool, GetLibraryRequest { id }).await }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Library>, Status>>()?;

    Ok(ListLibrariesResponse { libraries })
}

pub async fn create_library(
    db_pool: DbPool,
    request: CreateLibraryRequest,
) -> Result<Library, Status> {
    let library = request
        .library
        .ok_or_else(|| Status::invalid_argument("Library must be provided"))?;

    validate_library_payload(&library)?;

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut library_builder =
        QueryBuilder::new("insert into libraries (id, name, structure_definition) values (");

    let mut separated = library_builder.separated(", ");
    let library_id = uuid::Uuid::now_v7().to_string();
    separated.push_bind(&library_id);
    separated.push_bind(&library.name);
    separated.push_bind(&library.structure_definition);
    separated.push_unseparated(") returning *");

    let _row: LibraryRow = library_builder
        .build_query_as()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut root_builder = QueryBuilder::new("insert into root_directories (id, path) values (");

    let mut separated = root_builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(&library.path);
    separated.push_unseparated(")");
    root_builder.push(" on conflict (path) do update set path = excluded.path returning id");

    let root_directory_id: String = root_builder
        .build_query_scalar()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut map_builder = QueryBuilder::new(
        "insert into library_root_directories (library_id, root_directory_id) values (",
    );

    let mut separated = map_builder.separated(", ");
    separated.push_bind(&library_id);
    separated.push_bind(root_directory_id);
    separated.push_unseparated(") on conflict do nothing");

    map_builder
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    insert_library_ignore_patterns(&mut tx, &library_id, &library.ignore_patterns).await?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    get_library(db_pool, GetLibraryRequest { id: library_id }).await
}

pub async fn update_library(
    db_pool: DbPool,
    request: UpdateLibraryRequest,
) -> Result<Library, Status> {
    let library = request
        .library
        .ok_or_else(|| Status::invalid_argument("Library must be provided"))?;

    if library.id.is_empty() {
        return Err(Status::invalid_argument("Library ID must be provided"));
    }

    validate_library_payload(&library)?;

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut builder = QueryBuilder::new("update libraries set name = ");
    builder.push_bind(&library.name);
    builder.push(", structure_definition = ");
    builder.push_bind(&library.structure_definition);
    builder.push(" where id = ");
    builder.push_bind(&library.id);
    builder.push(" returning *");

    let _row: LibraryRow = builder
        .build_query_as()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut root_builder = QueryBuilder::new("insert into root_directories (id, path) values (");
    let mut separated = root_builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(&library.path);
    separated.push_unseparated(")");
    root_builder.push(" on conflict (path) do update set path = excluded.path returning id");

    let root_directory_id: String = root_builder
        .build_query_scalar()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    QueryBuilder::new("delete from library_root_directories where library_id = ")
        .push_bind(&library.id)
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut map_builder = QueryBuilder::new(
        "insert into library_root_directories (library_id, root_directory_id) values (",
    );

    let mut separated = map_builder.separated(", ");
    separated.push_bind(&library.id);
    separated.push_bind(root_directory_id);
    separated.push_unseparated(") on conflict do nothing");

    map_builder
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    QueryBuilder::new("delete from library_ignore_patterns where library_id = ")
        .push_bind(&library.id)
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    insert_library_ignore_patterns(&mut tx, &library.id, &library.ignore_patterns).await?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    get_library(
        db_pool,
        GetLibraryRequest {
            id: library.id.clone(),
        },
    )
    .await
}

pub async fn delete_library(
    db_pool: DbPool,
    request: DeleteLibraryRequest,
) -> Result<Empty, Status> {
    let id = request.id;

    if id.is_empty() {
        return Err(Status::invalid_argument("Library ID must be provided"));
    }

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let result = QueryBuilder::new("delete from libraries where id = ")
        .push_bind(&id)
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(Status::not_found("Library not found"));
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(Empty {})
}

pub async fn batch_create_libraries(
    db_pool: DbPool,
    request: BatchCreateLibrariesRequest,
) -> Result<BatchCreateLibrariesResponse, Status> {
    if request.libraries.is_empty() {
        return Err(Status::invalid_argument(
            "At least one library must be provided",
        ));
    }

    let libraries = join_all(request.libraries.into_iter().map(|library| {
        let db_pool = db_pool.clone();
        async move {
            create_library(
                db_pool,
                CreateLibraryRequest {
                    library: Some(library),
                },
            )
            .await
        }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Library>, Status>>()?;

    Ok(BatchCreateLibrariesResponse { libraries })
}

#[cfg(test)]
mod tests {
    use crate::library_handlers::*;
    use crate::{
        scan::scan_library_target,
        scan::LibraryScanTarget,
        tests::{
            create_test_game_dir, create_test_game_file, create_test_library_dir,
            create_test_platform_dir, get_test_db_pool,
        },
    };

    #[tokio::test]
    async fn test_get_library() -> Result<(), Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;

        let lib_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: lib_path.clone(),
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ..Default::default()
                }),
            },
        )
        .await?;

        let fetched_library = get_library(
            db_pool.clone(),
            GetLibraryRequest {
                id: library.id.clone(),
            },
        )
        .await?;

        assert_eq!(fetched_library.id, library.id);
        assert_eq!(&fetched_library.name, "test_library");
        assert_eq!(fetched_library.path, lib_path);
        assert_eq!(
            &fetched_library.structure_definition,
            "{library}/{platform}/{game}"
        );
        assert!(fetched_library.ignore_patterns.is_empty());

        Ok(())
    }

    #[tokio::test]
    async fn test_create_library() -> Result<(), Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;

        let lib_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: lib_path.clone(),
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ..Default::default()
                }),
            },
        )
        .await?;

        assert_eq!(library.name, "test_library");
        assert_eq!(library.path, lib_path);
        assert!(library.ignore_patterns.is_empty());

        Ok(())
    }

    #[tokio::test]
    async fn test_library_ignore_patterns_round_trip() -> Result<(), Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;

        let lib_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();

        let mut library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: lib_path.clone(),
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ignore_patterns: vec![".*/IgnoredPlatform(/.*)?$".to_string()],
                    ..Default::default()
                }),
            },
        )
        .await?;

        assert_eq!(
            library.ignore_patterns,
            vec![".*/IgnoredPlatform(/.*)?$".to_string()]
        );

        library.ignore_patterns = vec![
            ".*/IgnoredGame(/.*)?$".to_string(),
            ".*/skip\\.bin$".to_string(),
        ];

        let updated = update_library(
            db_pool.clone(),
            UpdateLibraryRequest {
                library: Some(library.clone()),
            },
        )
        .await?;

        assert_eq!(updated.ignore_patterns, library.ignore_patterns);

        let fetched = get_library(
            db_pool,
            GetLibraryRequest {
                id: updated.id.clone(),
            },
        )
        .await?;

        assert_eq!(fetched.ignore_patterns, library.ignore_patterns);

        Ok(())
    }

    #[tokio::test]
    async fn test_scan_library_respects_ignore_patterns() -> Result<(), Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;

        let included_platform_dir =
            create_test_platform_dir(&library_dir, "IncludedPlatform").await;
        let ignored_platform_dir = create_test_platform_dir(&library_dir, "IgnoredPlatform").await;
        let included_game_dir = create_test_game_dir(&included_platform_dir, "IncludedGame").await;
        let ignored_game_dir = create_test_game_dir(&included_platform_dir, "IgnoredGame").await;
        let _ignored_platform_game_dir =
            create_test_game_dir(&ignored_platform_dir, "IgnoredPlatformGame").await;

        let _kept_file = create_test_game_file(&included_game_dir, "keep.bin").await;
        let _ignored_file = create_test_game_file(&included_game_dir, "skip.bin").await;
        let _ignored_game_file = create_test_game_file(&ignored_game_dir, "ignored.bin").await;

        let library_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: library_path.clone(),
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ignore_patterns: vec![
                        ".*/IgnoredPlatform(/.*)?$".to_string(),
                        ".*/IgnoredGame(/.*)?$".to_string(),
                        ".*/skip\\.bin$".to_string(),
                    ],
                    ..Default::default()
                }),
            },
        )
        .await?;

        scan_library_target(
            &db_pool,
            &LibraryScanTarget {
                library_id: library.id,
                structure_definition: library.structure_definition,
                root_paths: vec![library_path],
                ignore_patterns: library.ignore_patterns,
            },
        )
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        let platform_count: i64 =
            sqlx::query_scalar("select count(*) from platforms where third_party = 0")
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        assert_eq!(platform_count, 1);

        let game_count: i64 =
            sqlx::query_scalar("select count(*) from games where third_party = 0")
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        assert_eq!(game_count, 1);

        let file_paths: Vec<String> = sqlx::query_scalar("select path from game_files")
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        assert_eq!(file_paths.len(), 1);
        assert!(file_paths[0].ends_with("keep.bin"));

        Ok(())
    }

    #[tokio::test]
    async fn test_delete_missing_entries() -> Result<(), Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;
        let platform_dir = create_test_platform_dir(&library_dir, "PlayStation").await;
        let game_dir = create_test_game_dir(&platform_dir, "Crash Bandicoot").await;
        let game_file = create_test_game_file(&game_dir, "Crash Bandicoot.bin").await;

        let platform_path = platform_dir
            .canonicalize()
            .expect("Failed to canonicalize platform path")
            .to_str()
            .expect("Failed to convert platform path to string")
            .to_string();
        let game_path = game_dir
            .canonicalize()
            .expect("Failed to canonicalize game path")
            .to_str()
            .expect("Failed to convert game path to string")
            .to_string();
        let game_file_path = game_file
            .canonicalize()
            .expect("Failed to canonicalize game file path")
            .to_str()
            .expect("Failed to convert game file path to string")
            .to_string();
        let library_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: library_path.clone(),
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ..Default::default()
                }),
            },
        )
        .await?;

        scan_library_target(
            &db_pool,
            &LibraryScanTarget {
                library_id: library.id,
                structure_definition: library.structure_definition,
                root_paths: vec![library_path],
                ignore_patterns: vec![],
            },
        )
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        tokio::fs::remove_dir_all(&platform_dir)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let response = delete_missing_entries(
            db_pool.clone(),
            DeleteMissingEntriesRequest { dry_run: false },
        )
        .await?;

        assert_eq!(response.platforms.len(), 1);
        assert_eq!(response.games.len(), 1);
        assert_eq!(response.game_files.len(), 1);

        assert!(response
            .platforms
            .iter()
            .any(|platform| platform.paths.contains(&platform_path)));
        assert!(response
            .games
            .iter()
            .any(|game| game.paths.contains(&game_path)));
        assert!(response
            .game_files
            .iter()
            .any(|gf| gf.path == game_file_path));

        for platform in &response.platforms {
            let count: i64 = sqlx::query_scalar("select count(*) from platforms where id = ?")
                .bind(&platform.id)
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
            assert_eq!(count, 0);
        }

        for game in &response.games {
            let count: i64 = sqlx::query_scalar("select count(*) from games where id = ?")
                .bind(&game.id)
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
            assert_eq!(count, 0);
        }

        for game_file in &response.game_files {
            let count: i64 = sqlx::query_scalar("select count(*) from game_files where id = ?")
                .bind(&game_file.id)
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
            assert_eq!(count, 0);
        }

        Ok(())
    }

    #[tokio::test]
    async fn test_delete_missing_entries_dry_run() -> Result<(), Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;
        let platform_dir = create_test_platform_dir(&library_dir, "PlayStation").await;
        let game_dir = create_test_game_dir(&platform_dir, "Crash Bandicoot").await;
        let _game_file = create_test_game_file(&game_dir, "Crash Bandicoot.bin").await;

        let library_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: library_path.clone(),
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ..Default::default()
                }),
            },
        )
        .await?;

        scan_library_target(
            &db_pool,
            &LibraryScanTarget {
                library_id: library.id,
                structure_definition: library.structure_definition,
                root_paths: vec![library_path],
                ignore_patterns: vec![],
            },
        )
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        tokio::fs::remove_dir_all(&platform_dir)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let response = delete_missing_entries(
            db_pool.clone(),
            DeleteMissingEntriesRequest { dry_run: true },
        )
        .await?;

        assert_eq!(response.platforms.len(), 1);
        assert_eq!(response.games.len(), 1);
        assert_eq!(response.game_files.len(), 1);

        for platform in &response.platforms {
            let count: i64 = sqlx::query_scalar("select count(*) from platforms where id = ?")
                .bind(&platform.id)
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
            assert_eq!(count, 1);
        }

        for game in &response.games {
            let count: i64 = sqlx::query_scalar("select count(*) from games where id = ?")
                .bind(&game.id)
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
            assert_eq!(count, 1);
        }

        for game_file in &response.game_files {
            let count: i64 = sqlx::query_scalar("select count(*) from game_files where id = ?")
                .bind(&game_file.id)
                .fetch_one(&db_pool)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
            assert_eq!(count, 1);
        }

        Ok(())
    }
}
