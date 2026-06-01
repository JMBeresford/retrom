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

    let mut builder =
        QueryBuilder::<RetromDB>::new("insert into libraries (name, structure_definition) values ");

    for (i, library) in request.libraries.iter().enumerate() {
        if i > 0 {
            builder.push(", ");
        }

        builder.push("(");
        let mut separated = builder.separated(", ");
        separated.push_bind(&library.name);
        separated.push_bind(&library.structure_definition);
        separated.push_unseparated(")");
    }

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
        let updated: Library = sqlx::query_as(
            "update libraries set name = $1, structure_definition = $2 where id = $3 returning *",
        )
        .bind(library.name)
        .bind(library.structure_definition)
        .bind(library.id)
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        libraries_updated.push(updated);
    }

    Ok(UpdateLibrariesResponse { libraries_updated })
}
