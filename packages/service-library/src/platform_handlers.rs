use retrom_codegen::retrom::services::{
    library::v1::{
        CreatePlatformsRequest, CreatePlatformsResponse, DeletePlatformsRequest,
        DeletePlatformsResponse, GetPlatformsRequest, GetPlatformsResponse, Platform,
        UpdatePlatformsRequest, UpdatePlatformsResponse,
    },
    metadata::v1::PlatformMetadata,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::QueryBuilder;
use tonic::Status;

pub async fn get_platforms(
    db_pool: DbPool,
    request: GetPlatformsRequest,
) -> Result<GetPlatformsResponse, Status> {
    let ids: Vec<String> = request.ids.into_iter().map(|id| id.to_string()).collect();
    let with_metadata = request.with_metadata.unwrap_or(false);
    let include_deleted = request.include_deleted.unwrap_or(false);

    let mut platforms_builder = QueryBuilder::<RetromDB>::new("select * from platforms");
    let mut has_condition = false;

    if !ids.is_empty() {
        platforms_builder.push(" where id in (");
        let mut separated = platforms_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
        has_condition = true;
    }

    if !include_deleted {
        if has_condition {
            platforms_builder.push(" and is_deleted = ");
        } else {
            platforms_builder.push(" where is_deleted = ");
        }
        platforms_builder.push_bind(false);
    }

    let platforms: Vec<Platform> = platforms_builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let metadata = if with_metadata {
        let mut metadata_builder = QueryBuilder::<RetromDB>::new("select * from platform_metadata");

        if !ids.is_empty() {
            metadata_builder.push(" where platform_id in (");
            let mut separated = metadata_builder.separated(", ");
            for id in &ids {
                separated.push_bind(id);
            }
            separated.push_unseparated(")");
        }

        let metadata: Vec<PlatformMetadata> = metadata_builder
            .build_query_as()
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        metadata
    } else {
        vec![]
    };

    Ok(GetPlatformsResponse {
        platforms,
        metadata,
    })
}

pub async fn create_platforms(
    db_pool: DbPool,
    request: CreatePlatformsRequest,
) -> Result<CreatePlatformsResponse, Status> {
    if request.platforms.is_empty() {
        return Err(Status::invalid_argument(
            "At least one platform must be provided",
        ));
    }

    let mut builder = QueryBuilder::<RetromDB>::new(
        "insert into platforms (id, is_deleted, third_party) values ",
    );

    for (i, platform) in request.platforms.iter().enumerate() {
        if i > 0 {
            builder.push(", ");
        }

        builder.push("(");
        let mut separated = builder.separated(", ");
        let id = if platform.id.is_empty() {
            uuid::Uuid::now_v7().to_string()
        } else {
            platform.id.clone()
        };
        separated.push_bind(id);
        separated.push_bind(platform.is_deleted);
        separated.push_bind(platform.third_party);
        separated.push_unseparated(")");
    }

    builder.push(" returning *");

    let platforms_created: Vec<Platform> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(CreatePlatformsResponse { platforms_created })
}

pub async fn update_platforms(
    db_pool: DbPool,
    request: UpdatePlatformsRequest,
) -> Result<UpdatePlatformsResponse, Status> {
    let mut platforms_updated = Vec::with_capacity(request.platforms.len());

    for platform in request.platforms {
        let updated: Platform = sqlx::query_as(
            "update platforms set deleted_at = $1, is_deleted = $2, third_party = $3 where id = $4 returning *",
        )
        .bind(platform.deleted_at)
        .bind(platform.is_deleted)
        .bind(platform.third_party)
        .bind(platform.id)
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        platforms_updated.push(updated);
    }

    Ok(UpdatePlatformsResponse { platforms_updated })
}

pub async fn delete_platforms(
    db_pool: DbPool,
    request: DeletePlatformsRequest,
) -> Result<DeletePlatformsResponse, Status> {
    let ids: Vec<String> = request.ids.into_iter().map(|id| id.to_string()).collect();

    if ids.is_empty() {
        return Ok(DeletePlatformsResponse {
            platforms_deleted: vec![],
        });
    }

    let mut builder = if request.blacklist_entries {
        QueryBuilder::<RetromDB>::new(
            "update platforms set is_deleted = 1, deleted_at = current_timestamp where third_party = 0 and id in (",
        )
    } else {
        QueryBuilder::<RetromDB>::new(
            "delete from platforms where third_party = 0 and id in (",
        )
    };

    let mut separated = builder.separated(", ");
    for id in &ids {
        separated.push_bind(id);
    }
    separated.push_unseparated(") returning *");

    let platforms_deleted: Vec<Platform> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(DeletePlatformsResponse { platforms_deleted })
}
