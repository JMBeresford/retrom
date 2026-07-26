use futures::future::join_all;
use pbjson_types::Empty;
use retrom_codegen::retrom::services::library::v1::{
    AddGameRootDirectoryRequest, AddGameRootDirectoryResponse, AddLibraryRootDirectoryRequest,
    AddLibraryRootDirectoryResponse, AddPlatformRootDirectoryRequest,
    AddPlatformRootDirectoryResponse, BatchCreateRootDirectoriesRequest,
    BatchCreateRootDirectoriesResponse, CreateRootDirectoryRequest, DeleteRootDirectoryRequest,
    GetRootDirectoryRequest, ListRootDirectoriesRequest, ListRootDirectoriesResponse,
    RootDirectory, RootDirectoryRow,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::QueryBuilder;
use std::{path::PathBuf, str::FromStr};
use tonic::Status;

fn rd_row_to_rd(row: RootDirectoryRow) -> RootDirectory {
    RootDirectory {
        id: row.id,
        path: row.path,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

pub async fn get_root_directory(
    db_pool: DbPool,
    request: GetRootDirectoryRequest,
) -> Result<RootDirectory, Status> {
    let mut builder = QueryBuilder::new("select * from root_directories where id = ");
    builder.push_bind(request.id);
    builder.push(" limit 1");

    let row: RootDirectoryRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let root_directory = rd_row_to_rd(row);

    Ok(root_directory)
}

pub async fn list_root_directories(
    db_pool: DbPool,
    request: ListRootDirectoriesRequest,
) -> Result<ListRootDirectoriesResponse, Status> {
    let root_directory_ids = request.root_directory_ids;
    let game_ids = request.game_ids;
    let platform_ids = request.platform_ids;
    let library_ids = request.library_ids;

    let mut builder = QueryBuilder::<RetromDB>::new("select * from root_directories");

    let mut where_clause = false;
    if !root_directory_ids.is_empty() {
        builder.push(" where id in (");
        let mut separated = builder.separated(", ");
        for id in &root_directory_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(") ");
        where_clause = true;
    }

    if !game_ids.is_empty() {
        if where_clause {
            builder.push(" and id in (select root_directory_id from game_root_directories where game_id in (");
        } else {
            builder.push(" where id in (select root_directory_id from game_root_directories where game_id in (");
        }
        let mut separated = builder.separated(", ");
        for id in &game_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")) ");
        where_clause = true;
    }

    if !platform_ids.is_empty() {
        if where_clause {
            builder.push(" and id in (select root_directory_id from platform_root_directories where platform_id in (");
        } else {
            builder.push(" where id in (select root_directory_id from platform_root_directories where platform_id in (");
        }
        let mut separated = builder.separated(", ");
        for id in &platform_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")) ");
        where_clause = true;
    }

    if !library_ids.is_empty() {
        if where_clause {
            builder.push(" and id in (select root_directory_id from library_root_directories where library_id in (");
        } else {
            builder.push(" where id in (select root_directory_id from library_root_directories where library_id in (");
        }
        let mut separated = builder.separated(", ");
        for id in &library_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")) ");
    }

    let rows: Vec<RootDirectoryRow> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let root_directories = rows.into_iter().map(rd_row_to_rd).collect();

    Ok(ListRootDirectoriesResponse { root_directories })
}

pub async fn create_root_directory(
    db_pool: DbPool,
    request: CreateRootDirectoryRequest,
) -> Result<RootDirectory, Status> {
    let path = request.path;

    if let Ok(Err(why)) = PathBuf::from_str(&path).map(|d| d.canonicalize()) {
        return Err(Status::invalid_argument(format!(
            "Invalid path provided: {}. Error: {}",
            path, why
        )));
    };

    let mut builder =
        QueryBuilder::<RetromDB>::new("insert into root_directories (id, path) values (");

    let mut separated = builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(path);

    builder.push(") on conflict (path) do update set path = excluded.path");
    builder.push(" returning *");

    let row: RootDirectoryRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let root_directory = rd_row_to_rd(row);

    Ok(root_directory)
}

pub async fn delete_root_directory(
    db_pool: DbPool,
    request: DeleteRootDirectoryRequest,
) -> Result<Empty, Status> {
    let mut builder = QueryBuilder::new("delete from root_directories where id = ");
    builder.push_bind(request.id);

    builder
        .build()
        .execute(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(Empty {})
}

pub async fn batch_create_root_directories(
    db_pool: DbPool,
    request: BatchCreateRootDirectoriesRequest,
) -> Result<BatchCreateRootDirectoriesResponse, Status> {
    let root_directories = join_all(request.requests.into_iter().map(|r| {
        let db_pool = db_pool.clone();

        async move { create_root_directory(db_pool, r).await }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<RootDirectory>, Status>>()?;

    Ok(BatchCreateRootDirectoriesResponse { root_directories })
}

pub async fn add_library_root_directory(
    db_pool: DbPool,
    request: AddLibraryRootDirectoryRequest,
) -> Result<AddLibraryRootDirectoryResponse, Status> {
    let library_id = request.library_id;

    let root_directory = create_root_directory(
        db_pool.clone(),
        CreateRootDirectoryRequest {
            path: request.path.clone(),
        },
    )
    .await?;

    let mut builder = QueryBuilder::new(
        "insert into library_root_directories (library_id, root_directory_id) values (",
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(library_id);
    separated.push_bind(&root_directory.id);

    builder.push(
        r#"
            ) on conflict
            do update set
                library_id = excluded.library_id,
                root_directory_id = excluded.root_directory_id
            returning *
        "#,
    );

    builder
        .build()
        .execute(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(AddLibraryRootDirectoryResponse {
        root_directory: Some(root_directory),
    })
}

pub async fn add_platform_root_directory(
    db_pool: DbPool,
    request: AddPlatformRootDirectoryRequest,
) -> Result<AddPlatformRootDirectoryResponse, Status> {
    let platform_id = request.platform_id;

    let root_directory = create_root_directory(
        db_pool.clone(),
        CreateRootDirectoryRequest {
            path: request.path.clone(),
        },
    )
    .await?;

    let mut builder = QueryBuilder::new(
        "insert into platform_root_directories (platform_id, root_directory_id) values (",
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(platform_id);
    separated.push_bind(&root_directory.id);

    builder.push(
        r#"
            ) on conflict
            do update set
                platform_id = excluded.platform_id,
                root_directory_id = excluded.root_directory_id
            returning *
        "#,
    );

    builder
        .build()
        .execute(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(AddPlatformRootDirectoryResponse {
        root_directory: Some(root_directory),
    })
}

pub async fn add_game_root_directory(
    db_pool: DbPool,
    request: AddGameRootDirectoryRequest,
) -> Result<AddGameRootDirectoryResponse, Status> {
    let game_id = request.game_id;

    let root_directory = create_root_directory(
        db_pool.clone(),
        CreateRootDirectoryRequest {
            path: request.path.clone(),
        },
    )
    .await?;

    let mut builder = QueryBuilder::new(
        "insert into game_root_directories (game_id, root_directory_id) values (",
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(game_id);
    separated.push_bind(&root_directory.id);

    builder.push(
        r#"
            ) on conflict
            do update set
                game_id = excluded.game_id,
                root_directory_id = excluded.root_directory_id
            returning *
        "#,
    );

    builder
        .build()
        .execute(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(AddGameRootDirectoryResponse {
        root_directory: Some(root_directory),
    })
}
