use retrom_codegen::retrom::services::library::v1::{
    CreateLibrariesRequest, CreateLibrariesResponse, GetLibrariesRequest, GetLibrariesResponse,
    Library, UpdateLibrariesRequest, UpdateLibrariesResponse,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::QueryBuilder;
use tonic::Status;

pub async fn get_libraries(
    db_pool: DbPool,
    request: GetLibrariesRequest,
) -> Result<GetLibrariesResponse, Status> {
    let mut builder = QueryBuilder::<RetromDB>::new("select * from libraries");

    if !request.ids.is_empty() {
        builder.push(" where id in (");
        let mut separated = builder.separated(", ");
        for id in &request.ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
    }

    let libraries: Vec<Library> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(GetLibrariesResponse { libraries })
}

pub async fn create_libraries(
    db_pool: DbPool,
    request: CreateLibrariesRequest,
) -> Result<CreateLibrariesResponse, Status> {
    if request.libraries.is_empty() {
        return Err(Status::invalid_argument(
            "At least one library must be provided",
        ));
    }

    let mut builder = QueryBuilder::<RetromDB>::new(
        "insert into libraries (id, name, structure_definition) values ",
    );

    builder.push_values(request.libraries.iter(), |mut row, library| {
        row.push_bind(uuid::Uuid::now_v7().to_string());
        row.push_bind(&library.name);
        row.push_bind(&library.structure_definition);
    });

    builder.push(" returning *");

    let libraries_created: Vec<Library> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(CreateLibrariesResponse { libraries_created })
}

pub async fn update_libraries(
    db_pool: DbPool,
    request: UpdateLibrariesRequest,
) -> Result<UpdateLibrariesResponse, Status> {
    let mut libraries_updated = Vec::with_capacity(request.libraries.len());

    for library in request.libraries {
        let mut builder = QueryBuilder::<RetromDB>::new("update libraries set name = ");
        builder.push_bind(library.name);
        builder.push(", structure_definition = ");
        builder.push_bind(library.structure_definition);
        builder.push(" where id = ");
        builder.push_bind(library.id);
        builder.push(" returning *");

        let updated: Library = builder
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        libraries_updated.push(updated);
    }

    Ok(UpdateLibrariesResponse { libraries_updated })
}
