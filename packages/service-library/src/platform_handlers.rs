use futures::future::join_all;
use retrom_codegen::retrom::services::library::v1::{
    AddPlatformRootDirectoryRequest, BatchCreatePlatformsRequest, BatchCreatePlatformsResponse,
    BatchDeleteGamesRequest, BatchDeletePlatformsRequest, BatchDeletePlatformsResponse,
    BatchGetPlatformsRequest, BatchGetPlatformsResponse, BatchUpdatePlatformsRequest,
    BatchUpdatePlatformsResponse, CreatePlatformRequest, DeleteGameRequest, DeletePlatformRequest,
    GetPlatformRequest, ListPlatformsRequest, ListPlatformsResponse, Platform, PlatformRow,
    UpdatePlatformRequest,
};
use retrom_db::DbPool;
use sqlx::QueryBuilder;
use tonic::Status;

use crate::{
    game_handlers::batch_delete_games, root_directory_handlers::add_platform_root_directory,
};

fn platform_row_to_platform(
    row: PlatformRow,
    paths: Vec<String>,
    libraries: Vec<String>,
) -> Platform {
    Platform {
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        is_deleted: row.is_deleted,
        third_party: row.third_party,
        paths,
        libraries,
    }
}

async fn get_platform_paths(db_pool: &DbPool, platform_id: &str) -> Result<Vec<String>, Status> {
    let paths: Vec<String> = QueryBuilder::new(
        r#"
        select rd.path from root_directories rd
        join platform_root_directories prd on prd.root_directory_id = rd.id
        where prd.platform_id = 
        "#,
    )
    .push_bind(platform_id)
    .build_query_scalar()
    .fetch_all(db_pool)
    .await
    .map_err(|e| Status::internal(e.to_string()))?;

    Ok(paths)
}

async fn get_platform_libraries(
    db_pool: &DbPool,
    platform_id: &str,
) -> Result<Vec<String>, Status> {
    QueryBuilder::new("select library_id from platform_libraries where platform_id = ")
        .push_bind(platform_id)
        .build_query_scalar()
        .fetch_all(db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))
}

pub async fn get_platform(
    db_pool: DbPool,
    request: GetPlatformRequest,
) -> Result<Platform, Status> {
    let id = request.id;

    if id.is_empty() {
        return Err(Status::invalid_argument("Platform ID must be provided"));
    }

    let row: PlatformRow = QueryBuilder::new("select * from platforms where id = ")
        .push_bind(&id)
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let paths = get_platform_paths(&db_pool, &id).await?;

    let libraries = get_platform_libraries(&db_pool, &id).await?;

    Ok(platform_row_to_platform(row, paths, libraries))
}

pub async fn list_platforms(
    db_pool: DbPool,
    request: ListPlatformsRequest,
) -> Result<ListPlatformsResponse, Status> {
    let include_deleted = request.include_deleted();
    let name = request.name;
    let ids = request.ids;

    let mut platforms_builder = QueryBuilder::new(
        r#"
        select p.id from platforms p
        join platform_metadata pm on pm.platform_id = p.id
        "#,
    );

    // Omit empty third-party platforms (e.g., Steam)
    platforms_builder.push(" where (third_party = ");
    platforms_builder.push_bind(false);
    platforms_builder.push(" or exists(select 1 from game_platforms where platform_id = p.id))");

    if !ids.is_empty() {
        platforms_builder.push(" and p.id in (");
        let mut separated = platforms_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
    }

    if !include_deleted {
        platforms_builder.push(" and is_deleted = ");
        platforms_builder.push_bind(false);
    }

    if let Some(name) = name {
        platforms_builder.push(" and pm.name like ");
        platforms_builder.push_bind(format!("%{}%", name));
    }

    let platform_ids: Vec<String> = platforms_builder
        .build_query_scalar()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let platforms = join_all(platform_ids.into_iter().map(|id| {
        let db_pool = db_pool.clone();
        async move { get_platform(db_pool.clone(), GetPlatformRequest { id }).await }
    }))
    .await
    .into_iter()
    .map(|result| result.map_err(|e| Status::internal(e.to_string())))
    .collect::<Result<Vec<Platform>, Status>>()?;

    Ok(ListPlatformsResponse { platforms })
}

pub async fn create_platform(
    db_pool: DbPool,
    request: CreatePlatformRequest,
) -> Result<Platform, Status> {
    let platform = request
        .platform
        .ok_or_else(|| Status::invalid_argument("Platform must be provided"))?;

    let platform_id = uuid::Uuid::now_v7().to_string();

    let row: PlatformRow = QueryBuilder::new("insert into platforms (id, third_party) ")
        .push_values(&[(&platform_id, false)], |mut b, (id, third_party)| {
            b.push_bind(id);
            b.push_bind(third_party);
        })
        .push(" returning *")
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if !platform.libraries.is_empty() {
        QueryBuilder::new("insert into platform_libraries (platform_id, library_id) ")
            .push_values(&platform.libraries, |mut row, library_id| {
                row.push_bind(&platform_id);
                row.push_bind(library_id);
            })
            .build()
            .execute(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    let paths = if !platform.paths.is_empty() {
        let responses = join_all(platform.paths.into_iter().map(|path| {
            let db_pool = db_pool.clone();
            let platform_id = platform_id.clone();
            async move {
                add_platform_root_directory(
                    db_pool,
                    AddPlatformRootDirectoryRequest { platform_id, path },
                )
                .await
            }
        }))
        .await
        .into_iter()
        .collect::<Result<Vec<_>, Status>>()?;

        responses
            .into_iter()
            .filter_map(|r| r.root_directory.map(|rd| rd.path))
            .collect::<Vec<String>>()
    } else {
        vec![]
    };

    Ok(platform_row_to_platform(row, paths, platform.libraries))
}

pub async fn update_platform(
    db_pool: DbPool,
    request: UpdatePlatformRequest,
) -> Result<Platform, Status> {
    let platform = request
        .platform
        .ok_or_else(|| Status::invalid_argument("Platform must be provided"))?;

    if platform.id.is_empty() {
        return Err(Status::invalid_argument("Platform ID must be provided"));
    }

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if !platform.libraries.is_empty() {
        let current_libraries: Vec<String> =
            QueryBuilder::new("select library_id from platform_libraries where platform_id = ")
                .push_bind(&platform.id)
                .build_query_scalar()
                .fetch_all(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let libraries_to_add: Vec<String> = platform
            .libraries
            .iter()
            .filter(|l| !current_libraries.contains(l))
            .cloned()
            .collect();

        if !libraries_to_add.is_empty() {
            QueryBuilder::new("insert into platform_libraries (platform_id, library_id) ")
                .push_values(&libraries_to_add, |mut row, library_id| {
                    row.push_bind(&platform.id);
                    row.push_bind(library_id);
                })
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }

        let libraries_to_remove: Vec<String> = current_libraries
            .iter()
            .filter(|l| !platform.libraries.contains(l))
            .cloned()
            .collect();

        if !libraries_to_remove.is_empty() {
            let mut builder =
                QueryBuilder::new("delete from platform_libraries where platform_id = ");
            builder.push_bind(&platform.id);
            builder.push(" and library_id in (");

            let mut separated = builder.separated(", ");
            for library_id in &libraries_to_remove {
                separated.push_bind(library_id);
            }
            separated.push_unseparated(")");

            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }
    }

    let current_paths = get_platform_paths(&db_pool, &platform.id).await?;
    let paths_to_add: Vec<String> = platform
        .paths
        .iter()
        .filter(|p| !current_paths.contains(p))
        .cloned()
        .collect();

    let paths_to_remove: Vec<String> = current_paths
        .iter()
        .filter(|p| !platform.paths.contains(p))
        .cloned()
        .collect();

    if !paths_to_remove.is_empty() {
        let mut builder =
            QueryBuilder::new("delete from platform_root_directories where platform_id = ");
        builder.push_bind(&platform.id);
        builder.push(" and root_directory_id in (select id from root_directories where path in (");

        let mut separated = builder.separated(", ");
        for path in &paths_to_remove {
            separated.push_bind(path);
        }
        separated.push_unseparated("))");

        builder
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    let row: PlatformRow = QueryBuilder::new("update platforms set deleted_at = ")
        .push_bind(platform.deleted_at)
        .push(", is_deleted = ")
        .push_bind(platform.is_deleted)
        .push(" where id = ")
        .push_bind(&platform.id)
        .push(" returning *")
        .build_query_as()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if !paths_to_add.is_empty() {
        join_all(paths_to_add.into_iter().map(|path| {
            let db_pool = db_pool.clone();
            let platform_id = platform.id.clone();
            async move {
                add_platform_root_directory(
                    db_pool,
                    AddPlatformRootDirectoryRequest { platform_id, path },
                )
                .await
            }
        }))
        .await
        .into_iter()
        .collect::<Result<Vec<_>, Status>>()?;
    }

    let paths = get_platform_paths(&db_pool, &platform.id).await?;
    let libraries = get_platform_libraries(&db_pool, &platform.id).await?;

    Ok(platform_row_to_platform(row, paths, libraries))
}

pub async fn delete_platform(
    db_pool: DbPool,
    request: DeletePlatformRequest,
) -> Result<Platform, Status> {
    let id = request.id;
    let soft_delete = request.soft_delete;
    let delete_from_disk = request.delete_from_disk;

    if id.is_empty() {
        return Err(Status::invalid_argument("Platform ID must be provided"));
    }

    let paths = get_platform_paths(&db_pool, &id).await?;
    let libraries = get_platform_libraries(&db_pool, &id).await?;

    let game_ids: Vec<String> =
        QueryBuilder::new("select distinct game_id from game_platforms where platform_id = ")
            .push_bind(&id)
            .build_query_scalar()
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    if !game_ids.is_empty() {
        batch_delete_games(
            db_pool.clone(),
            BatchDeleteGamesRequest {
                requests: game_ids
                    .into_iter()
                    .map(|game_id| DeleteGameRequest {
                        id: game_id,
                        delete_from_disk,
                        soft_delete,
                    })
                    .collect(),
            },
        )
        .await?;
    }

    let row: PlatformRow = if soft_delete {
        QueryBuilder::new("update platforms set is_deleted = ")
            .push_bind(true)
            .push(", deleted_at = current_timestamp where id = ")
            .push_bind(&id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    } else {
        QueryBuilder::new("delete from platforms where id = ")
            .push_bind(&id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    };

    Ok(platform_row_to_platform(row, paths, libraries))
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

pub async fn batch_create_platforms(
    db_pool: DbPool,
    request: BatchCreatePlatformsRequest,
) -> Result<BatchCreatePlatformsResponse, Status> {
    if request.platforms.is_empty() {
        return Err(Status::invalid_argument(
            "At least one platform must be provided",
        ));
    }

    let platforms = join_all(request.platforms.into_iter().map(|platform| {
        let db_pool = db_pool.clone();
        async move {
            create_platform(
                db_pool,
                CreatePlatformRequest {
                    platform: Some(platform),
                },
            )
            .await
        }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Platform>, Status>>()?;

    Ok(BatchCreatePlatformsResponse { platforms })
}

pub async fn batch_delete_platforms(
    db_pool: DbPool,
    request: BatchDeletePlatformsRequest,
) -> Result<BatchDeletePlatformsResponse, Status> {
    if request.ids.is_empty() {
        return Err(Status::invalid_argument(
            "At least one platform ID must be provided",
        ));
    }

    let platforms = join_all(request.ids.into_iter().map(|id| {
        let db_pool = db_pool.clone();
        let soft_delete = request.soft_delete;
        let delete_from_disk = request.delete_from_disk;
        async move {
            delete_platform(
                db_pool,
                DeletePlatformRequest {
                    id,
                    delete_from_disk,
                    soft_delete,
                },
            )
            .await
        }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Platform>, Status>>()?;

    Ok(BatchDeletePlatformsResponse { platforms })
}

pub async fn batch_update_platforms(
    db_pool: DbPool,
    request: BatchUpdatePlatformsRequest,
) -> Result<BatchUpdatePlatformsResponse, Status> {
    if request.platforms.is_empty() {
        return Err(Status::invalid_argument(
            "At least one platform must be provided",
        ));
    }

    let platforms = join_all(request.platforms.into_iter().map(|platform| {
        let db_pool = db_pool.clone();
        async move {
            update_platform(
                db_pool,
                UpdatePlatformRequest {
                    platform: Some(platform),
                },
            )
            .await
        }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Platform>, Status>>()?;

    Ok(BatchUpdatePlatformsResponse { platforms })
}

#[cfg(test)]
mod tests {
    use crate::library_handlers::*;
    use crate::platform_handlers::*;
    use crate::tests::{create_test_library_dir, create_test_platform_dir, get_test_db_pool};
    use retrom_codegen::retrom::services::library::v1::{
        CreateLibraryRequest, CreatePlatformRequest, GetPlatformRequest, Library, Platform,
    };

    #[tokio::test]
    async fn test_get_platform() -> Result<(), tonic::Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;
        let platform_dir = create_test_platform_dir(&library_dir, "PlayStation").await;

        let library_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();
        let platform_path = platform_dir
            .canonicalize()
            .expect("Failed to canonicalize platform path")
            .to_str()
            .expect("Failed to convert platform path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: library_path,
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ..Default::default()
                }),
            },
        )
        .await?;

        let created = create_platform(
            db_pool.clone(),
            CreatePlatformRequest {
                platform: Some(Platform {
                    paths: vec![platform_path.clone()],
                    libraries: vec![library.id.clone()],
                    ..Default::default()
                }),
            },
        )
        .await?;

        let platform = get_platform(
            db_pool,
            GetPlatformRequest {
                id: created.id.clone(),
            },
        )
        .await?;

        assert_eq!(platform.id, created.id);
        assert_eq!(platform.paths, vec![platform_path]);
        assert_eq!(platform.libraries, vec![library.id]);

        Ok(())
    }

    #[tokio::test]
    async fn test_create_platform() -> Result<(), tonic::Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;
        let platform_dir = create_test_platform_dir(&library_dir, "PlayStation").await;

        let library_path = library_dir
            .path()
            .to_str()
            .expect("Failed to convert library path to string")
            .to_string();
        let platform_path = platform_dir
            .canonicalize()
            .expect("Failed to canonicalize platform path")
            .to_str()
            .expect("Failed to convert platform path to string")
            .to_string();

        let library = create_library(
            db_pool.clone(),
            CreateLibraryRequest {
                library: Some(Library {
                    name: "test_library".to_string(),
                    path: library_path,
                    structure_definition: "{library}/{platform}/{game}".to_string(),
                    ..Default::default()
                }),
            },
        )
        .await?;

        let platform = create_platform(
            db_pool.clone(),
            CreatePlatformRequest {
                platform: Some(Platform {
                    paths: vec![platform_path.clone()],
                    libraries: vec![library.id.clone()],
                    ..Default::default()
                }),
            },
        )
        .await?;

        assert!(!platform.id.is_empty());
        assert_eq!(platform.paths, vec![platform_path.clone()]);
        assert_eq!(platform.libraries, vec![library.id.clone()]);

        Ok(())
    }

    #[tokio::test]
    async fn test_create_platform_with_no_library() -> Result<(), tonic::Status> {
        let db_pool = get_test_db_pool().await;
        let library_dir = create_test_library_dir().await;
        let platform_dir = create_test_platform_dir(&library_dir, "Dreamcast").await;

        let platform_path = platform_dir
            .canonicalize()
            .expect("Failed to canonicalize platform path")
            .to_str()
            .expect("Failed to convert platform path to string")
            .to_string();

        let platform = create_platform(
            db_pool.clone(),
            CreatePlatformRequest {
                platform: Some(Platform {
                    paths: vec![platform_path.clone()],
                    ..Default::default()
                }),
            },
        )
        .await?;

        assert!(!platform.id.is_empty());
        assert_eq!(platform.paths, vec![platform_path.clone()]);
        assert!(platform.libraries.is_empty());

        Ok(())
    }
}
