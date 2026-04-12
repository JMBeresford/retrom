use diesel::{ExpressionMethods, QueryDsl, SelectableHelper};
use diesel_async::{scoped_futures::ScopedFutureExt, AsyncConnection, RunQueryDsl};
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

    let values: Vec<_> = request
        .libraries
        .iter()
        .map(|lib| {
            (
                schema::libraries::name.eq(lib.name.clone()),
                schema::libraries::structure_definition.eq(lib.structure_definition.clone()),
            )
        })
        .collect();

    let libraries_created: Vec<Library> = diesel::insert_into(schema::libraries::table)
        .values(values)
        .returning(Library::as_returning())
        .get_results(&mut conn)
        .await
        .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

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

    let libraries = request.libraries;

    let libraries_updated = conn
        .transaction(|conn| {
            async move {
                let mut updated = Vec::with_capacity(libraries.len());

                for lib in libraries {
                    let row: Library = diesel::update(
                        schema::libraries::table.filter(schema::libraries::id.eq(lib.id)),
                    )
                    .set((
                        schema::libraries::name.eq(&lib.name),
                        schema::libraries::structure_definition.eq(&lib.structure_definition),
                    ))
                    .returning(Library::as_returning())
                    .get_result(conn)
                    .await?;

                    updated.push(row);
                }

                Ok::<_, diesel::result::Error>(updated)
            }
            .scope_boxed()
        })
        .await
        .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

    Ok(UpdateLibrariesResponse { libraries_updated })
}
