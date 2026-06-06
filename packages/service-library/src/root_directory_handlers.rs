use retrom_codegen::retrom::services::library::v1::{
    CreateRootDirectoriesRequest, CreateRootDirectoriesResponse, DeleteRootDirectoriesRequest,
    DeleteRootDirectoriesResponse, GetRootDirectoriesRequest, GetRootDirectoriesResponse,
    RootDirectory, UpdateRootDirectoriesRequest, UpdateRootDirectoriesResponse,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::QueryBuilder;
use tonic::Status;

pub async fn get_root_directories(
    db_pool: DbPool,
    request: GetRootDirectoriesRequest,
) -> Result<GetRootDirectoriesResponse, Status> {
    let mut builder = QueryBuilder::<RetromDB>::new("select * from root_directories");

    if !request.root_directory_ids.is_empty() {
        builder.push(" where id in (");
        let mut separated = builder.separated(", ");
        for id in &request.root_directory_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
    }

    let root_directories: Vec<RootDirectory> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(GetRootDirectoriesResponse { root_directories })
}

pub async fn create_root_directories(
    db_pool: DbPool,
    request: CreateRootDirectoriesRequest,
) -> Result<CreateRootDirectoriesResponse, Status> {
    if request.root_directories.is_empty() {
        return Err(Status::invalid_argument(
            "At least one root directory must be provided",
        ));
    }

    let mut builder =
        QueryBuilder::<RetromDB>::new("insert into root_directories (id, path) values ");

    builder.push_values(request.root_directories.iter(), |mut row, directory| {
        row.push_bind(uuid::Uuid::now_v7().to_string());
        row.push_bind(&directory.path);
    });

    builder.push(" returning *");

    let root_directories_created: Vec<RootDirectory> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(CreateRootDirectoriesResponse {
        root_directories_created,
    })
}

pub async fn update_root_directories(
    db_pool: DbPool,
    request: UpdateRootDirectoriesRequest,
) -> Result<UpdateRootDirectoriesResponse, Status> {
    let mut root_directories_updated = Vec::with_capacity(request.root_directories.len());

    for directory in request.root_directories {
        let mut builder = QueryBuilder::<RetromDB>::new("update root_directories set path = ");
        builder.push_bind(directory.path);
        builder.push(" where id = ");
        builder.push_bind(directory.id);
        builder.push(" returning *");

        let updated: RootDirectory = builder
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        root_directories_updated.push(updated);
    }

    Ok(UpdateRootDirectoriesResponse {
        root_directories_updated,
    })
}

pub async fn delete_root_directories(
    db_pool: DbPool,
    request: DeleteRootDirectoriesRequest,
) -> Result<DeleteRootDirectoriesResponse, Status> {
    if request.ids.is_empty() {
        return Ok(DeleteRootDirectoriesResponse {
            root_directories_deleted: vec![],
        });
    }

    let mut builder = QueryBuilder::<RetromDB>::new("delete from root_directories where id in (");
    let mut separated = builder.separated(", ");
    for id in &request.ids {
        separated.push_bind(id);
    }
    separated.push_unseparated(") returning *");

    let root_directories_deleted: Vec<RootDirectory> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(DeleteRootDirectoriesResponse {
        root_directories_deleted,
    })
}
