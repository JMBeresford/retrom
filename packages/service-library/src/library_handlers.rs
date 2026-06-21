use futures::future::join_all;
use retrom_codegen::retrom::services::{
    library::v1::{
        CreateLibrariesRequest, CreateLibrariesResponse, DeleteLibraryRequest,
        DeleteLibraryResponse, DeleteMissingEntriesRequest, DeleteMissingEntriesResponse, Game,
        GameFile, GetLibrariesRequest, GetLibrariesResponse, Library, Platform,
        UpdateLibrariesRequest, UpdateLibrariesResponse,
    },
    metadata::v1::{GameMetadata, PlatformMetadata},
};
use retrom_db::{DbPool, RetromDB};
use retrom_service_common::media_cache::cacheable_media::CacheableMetadata;
use sqlx::QueryBuilder;
use std::{collections::HashSet, path::PathBuf};
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
        QueryBuilder::<RetromDB>::new("insert into libraries (id, name, structure_definition) ");

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

pub async fn delete_library(
    db_pool: DbPool,
    _: DeleteLibraryRequest,
) -> Result<DeleteLibraryResponse, Status> {
    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let platform_metadata: Vec<PlatformMetadata> =
        QueryBuilder::new("select * from platform_metadata")
            .build_query_as()
            .fetch_all(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    let game_metadata: Vec<GameMetadata> = QueryBuilder::new("select * from game_metadata")
        .build_query_as()
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    // Clean caches for all metadata entries before deleting the entities.
    join_all(platform_metadata.iter().map(|m| m.clean_cache())).await;
    join_all(game_metadata.iter().map(|m| m.clean_cache())).await;

    // Delete all non-third-party platforms; cascades to game_platforms and game_files.
    sqlx::query("delete from platforms")
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    // Delete orphaned games (no remaining platform associations).
    sqlx::query("delete from games")
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(DeleteLibraryResponse {})
}

pub async fn delete_missing_entries(
    db_pool: DbPool,
    request: DeleteMissingEntriesRequest,
) -> Result<DeleteMissingEntriesResponse, Status> {
    // Fetch game files and perform filesystem checks outside the transaction
    // so we don't hold DB resources during potentially slow I/O.
    let all_game_files: Vec<GameFile> =
        sqlx::query_as("select * from game_files where is_deleted = false")
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    let mut game_files_to_delete: Vec<GameFile> = Vec::new();
    for game_file in all_game_files {
        let path = PathBuf::from(&game_file.path);
        match path.try_exists() {
            Ok(true) => continue,
            Ok(false) => game_files_to_delete.push(game_file),
            Err(why) => {
                tracing::warn!("Failed to check game file path: {}", why);
                continue;
            }
        }
    }

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let all_games: Vec<Game> = sqlx::query_as("select * from games where is_deleted = false")
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut games_to_delete: Vec<Game> = Vec::new();
    for game in all_games {
        // Count existing non-deleted game files for this game.
        let total_files: i64 = {
            let mut b = QueryBuilder::<RetromDB>::new(
                "select count(*) from game_files where is_deleted = false and game_id = ",
            );
            b.push_bind(&game.id);
            b.build_query_scalar()
                .fetch_one(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?
        };

        let being_deleted = game_files_to_delete
            .iter()
            .filter(|f| f.game_id == game.id)
            .count() as i64;

        if total_files - being_deleted <= 0 {
            games_to_delete.push(game);
        }
    }

    // Build a set of game IDs being deleted for the platform orphan check.
    let deleted_game_ids: HashSet<&String> = games_to_delete.iter().map(|g| &g.id).collect();

    let all_platforms: Vec<Platform> =
        sqlx::query_as("select * from platforms where is_deleted = false")
            .fetch_all(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    let mut platforms_to_delete: Vec<Platform> = Vec::new();
    for platform in all_platforms {
        // Fetch all game IDs mapped to this platform.
        let mapped_game_ids: Vec<String> = {
            let mut b = QueryBuilder::<RetromDB>::new(
                "select game_id from game_platforms where platform_id = ",
            );
            b.push_bind(&platform.id);
            b.build_query_scalar()
                .fetch_all(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?
        };

        // Platform is orphaned if it has no games, or every mapped game is being deleted.
        let has_surviving_game = mapped_game_ids
            .iter()
            .any(|gid| !deleted_game_ids.contains(gid));

        if !has_surviving_game {
            platforms_to_delete.push(platform);
        }
    }

    if !request.dry_run {
        if !game_files_to_delete.is_empty() {
            let mut builder = QueryBuilder::<RetromDB>::new("delete from game_files where id in (");
            let mut separated = builder.separated(", ");
            for f in &game_files_to_delete {
                separated.push_bind(&f.id);
            }
            separated.push_unseparated(")");
            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }

        if !games_to_delete.is_empty() {
            let mut builder = QueryBuilder::<RetromDB>::new("delete from games where id in (");
            let mut separated = builder.separated(", ");
            for game in &games_to_delete {
                separated.push_bind(&game.id);
            }
            separated.push_unseparated(")");
            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }

        if !platforms_to_delete.is_empty() {
            let mut builder = QueryBuilder::<RetromDB>::new("delete from platforms where id in (");
            let mut separated = builder.separated(", ");
            for platform in &platforms_to_delete {
                separated.push_bind(&platform.id);
            }
            separated.push_unseparated(")");
            builder
                .build()
                .execute(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;
        }
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(DeleteMissingEntriesResponse {
        platforms_deleted: platforms_to_delete,
        games_deleted: games_to_delete,
        game_files_deleted: game_files_to_delete,
    })
}
