use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::services::library::v1::{
    CreateLibrariesRequest, CreateLibrariesResponse, GetLibrariesRequest, GetLibrariesResponse,
    Library, UpdateLibrariesRequest, UpdateLibrariesResponse,
};
use retrom_db::{schema, Pool};
use std::sync::Arc;
use tonic::{Code, Status};

pub async fn get_libraries(
    db_pool: Arc<Pool>,
    request: GetLibrariesRequest,
) -> Result<GetLibrariesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let mut query = schema::libraries::table
        .into_boxed()
        .select(Library::as_select());

    if !request.ids.is_empty() {
        query = query.filter(schema::libraries::id.eq_any(&request.ids));
    }

    let libraries: Vec<Library> = match query.load(&mut conn).await {
        Ok(rows) => rows,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    Ok(GetLibrariesResponse { libraries })
}

pub async fn create_libraries(
    db_pool: Arc<Pool>,
    request: CreateLibrariesRequest,
) -> Result<CreateLibrariesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let mut libraries_created = Vec::new();

    for lib in request.libraries {
        let created: Library = diesel::insert_into(schema::libraries::table)
            .values((
                schema::libraries::name.eq(&lib.name),
                schema::libraries::structure_definition.eq(&lib.structure_definition),
            ))
            .returning(Library::as_returning())
            .get_result(&mut conn)
            .await
            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

        libraries_created.push(created);
    }

    Ok(CreateLibrariesResponse { libraries_created })
}

pub async fn update_libraries(
    db_pool: Arc<Pool>,
    request: UpdateLibrariesRequest,
) -> Result<UpdateLibrariesResponse, Status> {
    let mut conn = match db_pool.get().await {
        Ok(conn) => conn,
        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
    };

    let mut libraries_updated = Vec::new();

    for lib in request.libraries {
        let id = lib.id;

        let updated: Library =
            diesel::update(schema::libraries::table.filter(schema::libraries::id.eq(id)))
                .set((
                    schema::libraries::name.eq(&lib.name),
                    schema::libraries::structure_definition.eq(&lib.structure_definition),
                ))
                .returning(Library::as_returning())
                .get_result(&mut conn)
                .await
                .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

        libraries_updated.push(updated);
    }

    Ok(UpdateLibrariesResponse { libraries_updated })
}
