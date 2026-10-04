use futures::{
    future::join_all,
    stream::{self, StreamExt},
};
use pbjson_types::Empty;
use regex::Regex;
use retrom_codegen::retrom::services::library::v1::{
    CreateLibraryRequest, DeleteLibraryRequest, DeleteMissingEntriesRequest,
    DeleteMissingEntriesResponse, GameRow, GetLibraryRequest, Library, LibraryIgnorePatternRow,
    LibraryRow, ListLibrariesRequest, ListLibrariesResponse, PlatformRow, UpdateLibraryRequest,
};
use retrom_db::{page_cursor::PageCursor, DbPool};
use serde::{Deserialize, Serialize};
use sqlx::QueryBuilder;
use std::{path::PathBuf, sync::OnceLock};
use tonic::Status;
use tracing::warn;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct LibraryQueryFilter {
    display_name: Option<String>,
}

type LibraryCursor = PageCursor<LibraryQueryFilter>;

static NAME_MATCH_ROUTER: OnceLock<matchit::Router<&'static str>> = OnceLock::new();

fn get_name_matcher() -> &'static matchit::Router<&'static str> {
    NAME_MATCH_ROUTER.get_or_init(|| {
        let mut router = matchit::Router::new();

        router
            .insert("libraries/{library_id}", "Libraries handler")
            .expect("Failed to insert libraries route");

        router
    })
}

fn match_library_id(name: &str) -> Result<String, Status> {
    let library_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("library_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid library name"))?;

    match library_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Library ID not found in name: {name}"
        ))),
    }
}

async fn file_resource_exists(db_pool: &DbPool, file_id: &str) -> bool {
    let absolute_path: String =
        match QueryBuilder::new("select absolute_path from files where id = ")
            .push_bind(file_id)
            .build_query_scalar()
            .fetch_one(db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))
        {
            Ok(path) => path,
            Err(why) => {
                warn!(
                    "Could not retrieve absolute path for file id {}: error={}",
                    file_id, why
                );

                // Could not verify existence or non-existence of the file, so we will assume
                // it exists to avoid accidental deletion of the resource.
                return true;
            }
        };

    let path = PathBuf::from(&absolute_path);

    match PathBuf::from(path).try_exists() {
        Ok(true) => true,
        Ok(false) => false,
        Err(why) => {
            warn!(
                "Could not verify existence of file path {} for file id {}: error={}",
                absolute_path, file_id, why
            );

            true
        }
    }
}

async fn list_platforms_for_cleanup(db_pool: &DbPool) -> Result<Vec<PlatformRow>, Status> {
    QueryBuilder::new("select * from platforms where third_party = ")
        .push_bind(false)
        .push(" and is_deleted = ")
        .push_bind(false)
        .build_query_as()
        .fetch_all(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

async fn list_games_for_cleanup(db_pool: &DbPool) -> Result<Vec<GameRow>, Status> {
    QueryBuilder::new("select * from games where third_party = ")
        .push_bind(false)
        .push(" and is_deleted = ")
        .push_bind(false)
        .build_query_as()
        .fetch_all(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

fn library_row_to_library(row: LibraryRow, ignore_patterns: Vec<String>) -> Library {
    Library {
        name: format!("libraries/{}", row.id),
        file_root: format!("files/{}", row.file_root_id),
        display_name: row.display_name,
        structure_definition: row.structure_definition,
        created_at: row.created_at,
        updated_at: row.updated_at,
        ignore_patterns,
    }
}

fn validate_library_payload(library: &Library) -> Result<(), Status> {
    if library.name.is_empty() {
        return Err(Status::invalid_argument(
            "Library resource name must be provided",
        ));
    }

    if library.file_root.is_empty() {
        return Err(Status::invalid_argument(
            "Library file root must be provided",
        ));
    }

    if library.display_name.is_empty() {
        return Err(Status::invalid_argument(
            "Library display name must be provided",
        ));
    }

    if library.structure_definition.is_empty() {
        return Err(Status::invalid_argument(
            "Library structure definition must be provided",
        ));
    }

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
    let mut builder =
        QueryBuilder::new("select * from library_ignore_patterns where library_id = ");

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

    let missing_platforms = stream::iter(platforms)
        .filter_map(|platform| {
            let db_pool = db_pool.clone();
            async move {
                if file_resource_exists(&db_pool, &platform.file_root_id).await {
                    Some(platform)
                } else {
                    None
                }
            }
        })
        .collect::<Vec<PlatformRow>>()
        .await;

    let missing_games = stream::iter(games)
        .filter_map(|game| {
            let db_pool = db_pool.clone();
            async move {
                if file_resource_exists(&db_pool, &game.file_root_id).await {
                    Some(game)
                } else {
                    None
                }
            }
        })
        .collect::<Vec<GameRow>>()
        .await;

    let platform_ids = missing_platforms
        .iter()
        .map(|platform| platform.id.clone())
        .collect::<Vec<String>>();

    let game_ids = missing_games
        .iter()
        .map(|game| game.id.clone())
        .collect::<Vec<String>>();

    if !request.dry_run {
        let mut tx = db_pool
            .begin()
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

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

    let platforms = platform_ids
        .into_iter()
        .map(|id| format!("platforms/{}", id))
        .collect();

    let games = game_ids
        .into_iter()
        .map(|id| format!("games/{}", id))
        .collect();

    Ok(DeleteMissingEntriesResponse { platforms, games })
}

pub async fn get_library(db_pool: DbPool, request: GetLibraryRequest) -> Result<Library, Status> {
    let library_id = match_library_id(&request.name)?;

    let mut builder = QueryBuilder::new("select * from libraries where id = ");
    builder.push_bind(&library_id);
    builder.push(" limit 1");

    let row: Option<LibraryRow> = builder
        .build_query_as()
        .fetch_optional(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let row = row.ok_or_else(|| Status::not_found("Library not found"))?;

    let ignore_patterns = get_library_ignore_pattern_rows(&db_pool, &library_id)
        .await?
        .into_iter()
        .map(|row| row.pattern)
        .collect();

    Ok(library_row_to_library(row, ignore_patterns))
}

pub async fn list_libraries(
    db_pool: DbPool,
    request: ListLibrariesRequest,
) -> Result<ListLibrariesResponse, Status> {
    let cursor = match LibraryCursor::deserialize(request.page_token()) {
        Some(cursor) => cursor,
        None => {
            let parsed_limit = match request.page_size() {
                0 => 250, // Default page size
                n if n < 0 => {
                    return Err(Status::invalid_argument("Page size must be non-negative"))
                }
                n if n > 1000 => 1000, // Max page size
                n => n as u32,
            };

            let parsed_display_name = request.display_name;

            let initial_filter = LibraryQueryFilter {
                display_name: parsed_display_name,
            };

            LibraryCursor {
                offset: 0,
                page_size: parsed_limit,
                filter: initial_filter,
            }
        }
    };

    let current_filter = cursor.filter.clone();
    let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

    let mut builder = QueryBuilder::new("select id from libraries where id is not null ");

    if let Some(display_name) = current_filter.display_name {
        builder.push(" and lower(display_name) like ");
        builder.push_bind(format!("%{}%", display_name.to_lowercase()));
    }

    builder.push(" order by created_at desc, id asc limit ");
    builder.push_bind(query_limit);
    builder.push(" offset ");
    builder.push_bind(cursor.offset);

    let library_ids: Vec<String> = builder
        .build_query_scalar()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let num_rows_to_process = std::cmp::min(library_ids.len(), cursor.page_size as usize);

    let next_page_token = if library_ids.len() > cursor.page_size as usize {
        let next_cursor = LibraryCursor {
            offset: cursor.offset + cursor.page_size as u32,
            page_size: cursor.page_size,
            filter: cursor.filter,
        };

        Some(next_cursor.serialize())
    } else {
        None
    };

    let libraries = join_all(library_ids.into_iter().take(num_rows_to_process).map(|id| {
        let db_pool = db_pool.clone();
        async move {
            get_library(
                db_pool,
                GetLibraryRequest {
                    name: format!("libraries/{id}"),
                },
            )
            .await
        }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Library>, Status>>()?;

    Ok(ListLibrariesResponse {
        libraries,
        next_page_token,
    })
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

    let mut library_builder = QueryBuilder::new(
        "insert into libraries (id, file_root_id, display_name, structure_definition) values (",
    );

    let mut separated = library_builder.separated(", ");
    let library_id = uuid::Uuid::now_v7().to_string();
    separated.push_bind(&library_id);
    separated.push_bind(&library.file_root);
    separated.push_bind(&library.display_name);
    separated.push_bind(&library.structure_definition);
    separated.push_unseparated(")");

    library_builder
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    insert_library_ignore_patterns(&mut tx, &library_id, &library.ignore_patterns).await?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    get_library(
        db_pool,
        GetLibraryRequest {
            name: format!("libraries/{library_id}"),
        },
    )
    .await
}

pub async fn update_library(
    db_pool: DbPool,
    request: UpdateLibraryRequest,
) -> Result<Library, Status> {
    let library = request
        .library
        .ok_or_else(|| Status::invalid_argument("Library must be provided"))?;

    let library_id = match_library_id(&library.name)?;

    validate_library_payload(&library)?;

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut builder = QueryBuilder::new("update libraries set display_name = ");
    builder.push_bind(&library.display_name);
    builder.push(", structure_definition = ");
    builder.push_bind(&library.structure_definition);
    builder.push(" where id = ");
    builder.push_bind(&library_id);

    let update_result = builder
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if update_result.rows_affected() == 0 {
        return Err(Status::not_found("Library not found"));
    }

    QueryBuilder::new("delete from library_ignore_patterns where library_id = ")
        .push_bind(&library_id)
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    insert_library_ignore_patterns(&mut tx, &library_id, &library.ignore_patterns).await?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    get_library(
        db_pool,
        GetLibraryRequest {
            name: format!("libraries/{library_id}"),
        },
    )
    .await
}

pub async fn delete_library(
    db_pool: DbPool,
    request: DeleteLibraryRequest,
) -> Result<Empty, Status> {
    let library_id = match_library_id(&request.name)?;

    if library_id.is_empty() {
        return Err(Status::invalid_argument("Library ID must be provided"));
    }

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let result = QueryBuilder::new("delete from libraries where id = ")
        .push_bind(&library_id)
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
