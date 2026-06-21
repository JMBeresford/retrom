use retrom_codegen::retrom::services::library::v1::{
    CreateGamesRequest, CreateGamesResponse, DeleteGameFilesRequest, DeleteGameFilesResponse,
    DeleteGamesRequest, DeleteGamesResponse, Game, GameFile, GetGameFilesRequest,
    GetGameFilesResponse, GetGamesRequest, GetGamesResponse, UpdateGameFilesRequest,
    UpdateGameFilesResponse, UpdateGamesRequest, UpdateGamesResponse,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::QueryBuilder;
use std::path::PathBuf;
use tonic::Status;

pub async fn get_games(
    db_pool: DbPool,
    request: GetGamesRequest,
) -> Result<GetGamesResponse, Status> {
    let include_deleted = request.include_deleted.unwrap_or(false);
    let with_metadata = request.with_metadata.unwrap_or(false);
    let with_files = request.with_files.unwrap_or(false);
    let ids = request.ids;
    let platform_ids = request.platform_ids;

    let mut games_builder = QueryBuilder::<RetromDB>::new("select * from games");
    let mut has_condition = false;

    if !ids.is_empty() {
        games_builder.push(" where id in (");
        let mut separated = games_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
        has_condition = true;
    }

    if !platform_ids.is_empty() {
        let clause = if has_condition {
            " and id in (select game_id from game_platforms where platform_id in ("
        } else {
            " where id in (select game_id from game_platforms where platform_id in ("
        };
        games_builder.push(clause);
        let mut separated = games_builder.separated(", ");
        for id in &platform_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated("))");
        has_condition = true;
    }

    if !include_deleted {
        if has_condition {
            games_builder.push(" and is_deleted = ");
        } else {
            games_builder.push(" where is_deleted = ");
        }
        games_builder.push_bind(false);
    }

    let games: Vec<Game> = games_builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let metadata = if with_metadata && !games.is_empty() {
        let mut builder =
            QueryBuilder::<RetromDB>::new("select * from game_metadata where game_id in (");
        let mut separated = builder.separated(", ");
        for game in &games {
            separated.push_bind(&game.id);
        }
        separated.push_unseparated(")");

        builder
            .build_query_as()
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    } else {
        vec![]
    };

    let game_files = if with_files && !games.is_empty() {
        let mut builder =
            QueryBuilder::<RetromDB>::new("select * from game_files where game_id in (");
        let mut separated = builder.separated(", ");
        for game in &games {
            separated.push_bind(&game.id);
        }
        separated.push_unseparated(")");

        if !include_deleted {
            builder.push(" and is_deleted = ");
            builder.push_bind(false);
        }

        builder
            .build_query_as()
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    } else {
        vec![]
    };

    Ok(GetGamesResponse {
        games,
        metadata,
        game_files,
    })
}

pub async fn create_games(
    db_pool: DbPool,
    request: CreateGamesRequest,
) -> Result<CreateGamesResponse, Status> {
    if request.games.is_empty() {
        return Err(Status::invalid_argument(
            "At least one game must be provided",
        ));
    }

    let mut builder = QueryBuilder::<RetromDB>::new(
        "insert into games (id, is_deleted, third_party, steam_app_id) values ",
    );

    builder.push_values(request.games.iter(), |mut row, game| {
        row.push_bind(uuid::Uuid::now_v7().to_string());
        row.push_bind(game.is_deleted);
        row.push_bind(game.third_party);
        row.push_bind(&game.steam_app_id);
    });

    builder.push(" returning *");

    let games_created: Vec<Game> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(CreateGamesResponse { games_created })
}

pub async fn update_games(
    db_pool: DbPool,
    request: UpdateGamesRequest,
) -> Result<UpdateGamesResponse, Status> {
    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut games_updated = Vec::with_capacity(request.games.len());

    for game in request.games {
        let mut builder = QueryBuilder::<RetromDB>::new("update games set deleted_at = ");
        builder.push_bind(game.deleted_at);
        builder.push(", is_deleted = ");
        builder.push_bind(game.is_deleted);
        builder.push(", third_party = ");
        builder.push_bind(game.third_party);
        builder.push(", steam_app_id = ");
        builder.push_bind(game.steam_app_id);
        builder.push(" where id = ");
        builder.push_bind(game.id);
        builder.push(" returning *");

        let updated: Game = builder
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        games_updated.push(updated);
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(UpdateGamesResponse { games_updated })
}

pub async fn delete_games(
    db_pool: DbPool,
    request: DeleteGamesRequest,
) -> Result<DeleteGamesResponse, Status> {
    let ids = request.ids;

    if ids.is_empty() {
        return Ok(DeleteGamesResponse {
            games_deleted: vec![],
        });
    }

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let game_files_to_delete: Vec<GameFile> = if request.delete_from_disk {
        let mut files_for_delete_builder =
            QueryBuilder::<RetromDB>::new("select * from game_files where game_id in (");
        let mut separated = files_for_delete_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");

        files_for_delete_builder
            .build_query_as()
            .fetch_all(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    } else {
        vec![]
    };

    if request.blacklist_entries {
        let mut files_builder =
            QueryBuilder::<RetromDB>::new("update game_files set is_deleted = ");
        files_builder.push_bind(true);
        files_builder.push(", deleted_at = current_timestamp where game_id in (");
        let mut separated = files_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");

        files_builder
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    let mut builder = if request.blacklist_entries {
        let mut builder = QueryBuilder::<RetromDB>::new("update games set is_deleted = ");
        builder.push_bind(true);
        builder.push(", deleted_at = current_timestamp where id in (");
        builder
    } else {
        QueryBuilder::<RetromDB>::new("delete from games where id in (")
    };

    let mut separated = builder.separated(", ");
    for id in &ids {
        separated.push_bind(id);
    }
    separated.push_unseparated(") returning *");

    let games_deleted: Vec<Game> = builder
        .build_query_as()
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if request.delete_from_disk {
        for game_file in &game_files_to_delete {
            let file_path = PathBuf::from(&game_file.path);
            if !file_path.exists() {
                continue;
            }

            let result = if file_path.is_dir() {
                tokio::fs::remove_dir_all(&file_path).await
            } else {
                tokio::fs::remove_file(&file_path).await
            };

            if let Err(why) = result {
                return Err(Status::internal(format!(
                    "Failed to remove game file {} from disk: {}",
                    game_file.id, why
                )));
            }
        }
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(DeleteGamesResponse { games_deleted })
}

pub async fn get_game_files(
    db_pool: DbPool,
    request: GetGameFilesRequest,
) -> Result<GetGameFilesResponse, Status> {
    let include_deleted = request.include_deleted.unwrap_or(false);
    let ids = request.ids;
    let game_ids = request.game_ids;

    let mut builder = QueryBuilder::<RetromDB>::new("select * from game_files");
    let mut has_condition = false;

    if !ids.is_empty() {
        builder.push(" where id in (");
        let mut separated = builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
        has_condition = true;
    }

    if !game_ids.is_empty() {
        if has_condition {
            builder.push(" and game_id in (");
        } else {
            builder.push(" where game_id in (");
        }
        let mut separated = builder.separated(", ");
        for id in &game_ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");
        has_condition = true;
    }

    if !include_deleted {
        if has_condition {
            builder.push(" and is_deleted = ");
        } else {
            builder.push(" where is_deleted = ");
        }
        builder.push_bind(false);
    }

    let game_files: Vec<GameFile> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(GetGameFilesResponse { game_files })
}

pub async fn update_game_files(
    db_pool: DbPool,
    request: UpdateGameFilesRequest,
) -> Result<UpdateGameFilesResponse, Status> {
    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut game_files_updated = Vec::with_capacity(request.game_files.len());

    for game_file in request.game_files {
        let mut builder = QueryBuilder::<RetromDB>::new("update game_files set byte_size = ");
        builder.push_bind(game_file.byte_size);
        builder.push(", path = ");
        builder.push_bind(game_file.path);
        builder.push(", game_id = ");
        builder.push_bind(game_file.game_id);
        builder.push(", platform_id = ");
        builder.push_bind(game_file.platform_id);
        builder.push(", deleted_at = ");
        builder.push_bind(game_file.deleted_at);
        builder.push(", is_deleted = ");
        builder.push_bind(game_file.is_deleted);
        builder.push(" where id = ");
        builder.push_bind(game_file.id);
        builder.push(" returning *");

        let updated: GameFile = builder
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        game_files_updated.push(updated);
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(UpdateGameFilesResponse { game_files_updated })
}

pub async fn delete_game_files(
    db_pool: DbPool,
    request: DeleteGameFilesRequest,
) -> Result<DeleteGameFilesResponse, Status> {
    let ids = request.ids;

    if ids.is_empty() {
        return Ok(DeleteGameFilesResponse {
            game_files_deleted: vec![],
        });
    }

    let mut builder = if request.blacklist_entries {
        let mut builder = QueryBuilder::<RetromDB>::new("update game_files set is_deleted = ");
        builder.push_bind(true);
        builder.push(", deleted_at = current_timestamp where id in (");
        builder
    } else {
        QueryBuilder::<RetromDB>::new("delete from game_files where id in (")
    };

    let mut separated = builder.separated(", ");
    for id in &ids {
        separated.push_bind(id);
    }
    separated.push_unseparated(") returning *");

    let game_files_deleted: Vec<GameFile> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if request.delete_from_disk {
        for game_file in &game_files_deleted {
            let file_path = PathBuf::from(&game_file.path);
            if !file_path.exists() {
                continue;
            }

            let result = if file_path.is_dir() {
                tokio::fs::remove_dir_all(&file_path).await
            } else {
                tokio::fs::remove_file(&file_path).await
            };

            if let Err(why) = result {
                tracing::error!(
                    "Failed to remove game file {} from disk: {}",
                    game_file.id,
                    why
                );
            }
        }
    }

    Ok(DeleteGameFilesResponse { game_files_deleted })
}
