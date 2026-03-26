use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::services::library::v1::{
    CreateRootDirectoriesRequest, CreateRootDirectoriesResponse, DeleteRootDirectoriesRequest,
    DeleteRootDirectoriesResponse, GetRootDirectoriesRequest, GetRootDirectoriesResponse,
    RootDirectory, UpdateRootDirectoriesRequest, UpdateRootDirectoriesResponse,
};
use retrom_db::{schema, Pool};
use std::sync::Arc;
use tonic::{Code, Status};

pub async fn get_root_directories(
    db_pool: Arc<Pool>,
    request: GetRootDirectoriesRequest,
) -> Result<GetRootDirectoriesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let mut query = schema::root_directories::table
        .into_boxed()
        .select(RootDirectory::as_select());

    if !request.ids.is_empty() {
        query = query.filter(schema::root_directories::id.eq_any(&request.ids));
    }

    let root_directories: Vec<RootDirectory> = match query.load(&mut conn).await {
        Ok(rows) => rows,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    Ok(GetRootDirectoriesResponse { root_directories })
}

pub async fn create_root_directories(
    db_pool: Arc<Pool>,
    request: CreateRootDirectoriesRequest,
) -> Result<CreateRootDirectoriesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let mut root_directories_created = Vec::new();

    for dir in request.root_directories {
        let created: RootDirectory = diesel::insert_into(schema::root_directories::table)
            .values(schema::root_directories::path.eq(&dir.path))
            .returning(RootDirectory::as_returning())
            .get_result(&mut conn)
            .await
            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

        root_directories_created.push(created);
    }

    Ok(CreateRootDirectoriesResponse {
        root_directories_created,
    })
}

pub async fn update_root_directories(
    db_pool: Arc<Pool>,
    request: UpdateRootDirectoriesRequest,
) -> Result<UpdateRootDirectoriesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let mut root_directories_updated = Vec::new();

    for dir in request.root_directories {
        let id = dir.id;

        let updated: RootDirectory = diesel::update(
            schema::root_directories::table.filter(schema::root_directories::id.eq(id)),
        )
        .set(schema::root_directories::path.eq(&dir.path))
        .returning(RootDirectory::as_returning())
        .get_result(&mut conn)
        .await
        .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

        root_directories_updated.push(updated);
    }

    Ok(UpdateRootDirectoriesResponse {
        root_directories_updated,
    })
}

pub async fn delete_root_directories(
    db_pool: Arc<Pool>,
    request: DeleteRootDirectoriesRequest,
) -> Result<DeleteRootDirectoriesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let root_directories_deleted: Vec<RootDirectory> = diesel::delete(
        schema::root_directories::table.filter(schema::root_directories::id.eq_any(&request.ids)),
    )
    .returning(RootDirectory::as_returning())
    .get_results(&mut conn)
    .await
    .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

    Ok(DeleteRootDirectoriesResponse {
        root_directories_deleted,
    })
}
