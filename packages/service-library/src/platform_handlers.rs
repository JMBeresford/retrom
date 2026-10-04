use std::{path::PathBuf, sync::OnceLock};

use futures::future::join_all;
use retrom_codegen::retrom::services::library::v1::{
    BatchGetPlatformsRequest, BatchGetPlatformsResponse, CreatePlatformRequest,
    DeletePlatformRequest, GetPlatformRequest, ListPlatformsRequest, ListPlatformsResponse,
    Platform, PlatformRow, UpdatePlatformRequest,
};
use retrom_db::{page_cursor::PageCursor, DbPool};
use serde::{Deserialize, Serialize};
use sqlx::QueryBuilder;
use tonic::Status;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct PlatformQueryFilter {
    parent: Option<String>,
    include_deleted: bool,
    title: Option<String>,
}

type PlatformCursor = PageCursor<PlatformQueryFilter>;

static NAME_MATCH_ROUTER: OnceLock<matchit::Router<&'static str>> = OnceLock::new();

fn get_name_matcher() -> &'static matchit::Router<&'static str> {
    NAME_MATCH_ROUTER.get_or_init(|| {
        let mut router = matchit::Router::new();

        router
            .insert("platforms/{platform_id}", "Libraries handler")
            .expect("Failed to insert platforms route");

        router
            .insert("libraries/{library_id}", "Libraries handler")
            .expect("Failed to insert libraries route");

        router
    })
}

fn match_platform_id(name: &str) -> Result<String, Status> {
    let platform_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("platform_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid platform name"))?;

    match platform_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Platform ID not found in name: {name}"
        ))),
    }
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

fn platform_row_to_platform(row: PlatformRow) -> Platform {
    Platform {
        name: format!("platforms/{}", row.id),
        parent: format!("libraries/{}", row.library_id),
        file_root: format!("files/{}", row.file_root_id),
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        is_deleted: row.is_deleted,
        third_party: row.third_party,
    }
}

pub async fn get_platform(
    db_pool: DbPool,
    request: GetPlatformRequest,
) -> Result<Platform, Status> {
    let platform_id = match_platform_id(&request.name)?;

    let row: Option<PlatformRow> = QueryBuilder::new("select * from platforms where id = ")
        .push_bind(&platform_id)
        .push(" limit 1")
        .build_query_as()
        .fetch_optional(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if let Some(row) = row {
        Ok(platform_row_to_platform(row))
    } else {
        Err(Status::not_found(format!(
            "Platform with ID {} not found",
            platform_id
        )))
    }
}

pub async fn list_platforms(
    db_pool: DbPool,
    request: ListPlatformsRequest,
) -> Result<ListPlatformsResponse, Status> {
    let cursor = match PlatformCursor::deserialize(request.page_token()) {
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

            let initial_filter = PlatformQueryFilter {
                include_deleted: request.include_deleted(),
                parent: request.parent,
                title: request.title,
            };

            PlatformCursor {
                offset: 0,
                page_size: parsed_limit,
                filter: initial_filter,
            }
        }
    };

    let current_filter = cursor.filter.clone();
    let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

    let mut builder = QueryBuilder::new("select * from platforms where id is not null ");

    if let Some(ref parent) = current_filter.parent {
        let library_id = match_library_id(parent)?;
        builder.push(" and library_id = ");
        builder.push_bind(library_id);
    }

    if let Some(ref title) = current_filter.title {
        builder.push(" and lower(title) like ");
        builder.push_bind(format!("%{}%", title.to_lowercase()));
    }

    builder.push(" and is_deleted = ");
    builder.push_bind(current_filter.include_deleted);
    builder.push(" order by created_at desc limit ");
    builder.push_bind(query_limit);
    builder.push(" offset ");
    builder.push_bind(cursor.offset);

    let rows: Vec<PlatformRow> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut platforms = Vec::new();
    let num_row_to_process = std::cmp::min(rows.len(), cursor.page_size as usize);

    let next_page_token = if rows.len() > num_row_to_process {
        let next_cursor = PlatformCursor {
            offset: cursor.offset + num_row_to_process as u32,
            page_size: cursor.page_size,
            filter: current_filter,
        };
        Some(next_cursor.serialize())
    } else {
        None
    };

    for row in rows.into_iter().take(num_row_to_process) {
        platforms.push(platform_row_to_platform(row));
    }

    Ok(ListPlatformsResponse {
        platforms,
        next_page_token,
    })
}

pub async fn create_platform(
    db_pool: DbPool,
    request: CreatePlatformRequest,
) -> Result<Platform, Status> {
    let platform = request
        .platform
        .ok_or_else(|| Status::invalid_argument("Platform must be provided"))?;

    let platform_id = uuid::Uuid::now_v7().to_string();
    let library_id = match_library_id(&platform.parent)?;
    let file_root_id = match_library_id(&platform.file_root)?;

    let mut builder = QueryBuilder::new(
        r#"
        insert into platforms (
            id,
            library_id,
            file_root_id,
            third_party
        ) values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(&platform_id);
    separated.push_bind(&library_id);
    separated.push_bind(&file_root_id);
    separated.push_bind(false);

    builder.push(") returning *");

    let row: PlatformRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(platform_row_to_platform(row))
}

pub async fn update_platform(
    db_pool: DbPool,
    request: UpdatePlatformRequest,
) -> Result<Platform, Status> {
    let platform = request
        .platform
        .ok_or_else(|| Status::invalid_argument("Platform must be provided"))?;

    let platform_id = match_platform_id(&platform.name)?;

    // UpdatePlatform is currently a no-op since we don't have any mutable fields
    // on the Platform resource.
    get_platform(
        db_pool,
        GetPlatformRequest {
            name: format!("platforms/{}", platform_id),
        },
    )
    .await
}

pub async fn delete_platform(
    db_pool: DbPool,
    request: DeletePlatformRequest,
) -> Result<Platform, Status> {
    let platform_id = match_platform_id(&request.name)?;

    let soft_delete = request.soft_delete();
    let delete_from_disk = request.delete_from_disk();

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let row: Option<PlatformRow> = if soft_delete {
        QueryBuilder::new("update platforms set is_deleted = ")
            .push_bind(true)
            .push(", deleted_at = current_timestamp where id = ")
            .push_bind(&platform_id)
            .push(" returning *")
            .build_query_as()
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    } else {
        QueryBuilder::new("delete from platforms where id = ")
            .push_bind(&platform_id)
            .push(" returning *")
            .build_query_as()
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    };

    let row = row
        .ok_or_else(|| Status::not_found(format!("Platform with ID {} not found", platform_id)))?;

    if delete_from_disk {
        let absolute_path: String = QueryBuilder::new(
            r#"
                select f.absolute_path from files f
                join platforms p on f.id = p.file_root_id
                where p.id =
            "#,
        )
        .push_bind(&platform_id)
        .build_query_scalar()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        let path = PathBuf::from(&absolute_path);

        if path.exists() {
            tokio::fs::remove_dir_all(path)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(platform_row_to_platform(row))
}

pub async fn batch_get_platforms(
    db_pool: DbPool,
    request: BatchGetPlatformsRequest,
) -> Result<BatchGetPlatformsResponse, Status> {
    let requests = request.requests;

    if requests.is_empty() {
        return Err(Status::invalid_argument(
            "At least one platform ID must be provided",
        ));
    }

    let platforms = join_all(requests.into_iter().map(|req| {
        let db_pool = db_pool.clone();
        async move { get_platform(db_pool.clone(), req).await }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Platform>, Status>>()?;

    Ok(BatchGetPlatformsResponse { platforms })
}
