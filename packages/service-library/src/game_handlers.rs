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

    let ids: Vec<String> = request.ids.into_iter().map(|id| id.to_string()).collect();
    let platform_ids: Vec<String> = request
        .platform_ids
        .into_iter()
        .map(|id| id.to_string())
        .collect();

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
            " and id in (select game_id from game_platform_maps where platform_id in ("
        } else {
            " where id in (select game_id from game_platform_maps where platform_id in ("
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

    let game_ids: Vec<String> = games.iter().map(|g| g.id.clone()).collect();

    let metadata = if with_metadata && !game_ids.is_empty() {
        let mut builder =
            QueryBuilder::<RetromDB>::new("select * from game_metadata where game_id in (");
        let mut separated = builder.separated(", ");
        for id in &game_ids {
            separated.push_bind(id);
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

    let game_files = if with_files && !game_ids.is_empty() {
        let mut builder =
            QueryBuilder::<RetromDB>::new("select * from game_files where game_id in (");
        let mut separated = builder.separated(", ");
        for id in &game_ids {
            separated.push_bind(id);
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

    for (i, game) in request.games.iter().enumerate() {
        if i > 0 {
            builder.push(", ");
        }

        builder.push("(");
        let mut separated = builder.separated(", ");
        let id = if game.id.is_empty() {
            uuid::Uuid::now_v7().to_string()
        } else {
            game.id.clone()
        };
        separated.push_bind(id);
        separated.push_bind(game.is_deleted);
        separated.push_bind(game.third_party);
        separated.push_bind(&game.steam_app_id);
        separated.push_unseparated(")");
    }

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
    let mut games_updated = Vec::with_capacity(request.games.len());

    for game in request.games {
        let updated: Game = sqlx::query_as(
            "update games set deleted_at = $1, is_deleted = $2, third_party = $3, steam_app_id = $4 where id = $5 returning *",
        )
        .bind(game.deleted_at)
        .bind(game.is_deleted)
        .bind(game.third_party)
        .bind(game.steam_app_id)
        .bind(game.id)
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        games_updated.push(updated);
    }

    Ok(UpdateGamesResponse { games_updated })
}

pub async fn delete_games(
    db_pool: DbPool,
    request: DeleteGamesRequest,
) -> Result<DeleteGamesResponse, Status> {
    let ids: Vec<String> = request.ids.into_iter().map(|id| id.to_string()).collect();

    if ids.is_empty() {
        return Ok(DeleteGamesResponse {
            games_deleted: vec![],
        });
    }

    if request.blacklist_entries {
        let mut files_builder = QueryBuilder::<RetromDB>::new(
            "update game_files set is_deleted = 1, deleted_at = current_timestamp where game_id in (",
        );
        let mut separated = files_builder.separated(", ");
        for id in &ids {
            separated.push_bind(id);
        }
        separated.push_unseparated(")");

        files_builder
            .build()
            .execute(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    let mut builder = if request.blacklist_entries {
        QueryBuilder::<RetromDB>::new(
            "update games set is_deleted = 1, deleted_at = current_timestamp where id in (",
        )
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
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(DeleteGamesResponse { games_deleted })
}

pub async fn get_game_files(
    db_pool: DbPool,
    request: GetGameFilesRequest,
) -> Result<GetGameFilesResponse, Status> {
    let include_deleted = request.include_deleted.unwrap_or(false);
    let ids: Vec<String> = request.ids.into_iter().map(|id| id.to_string()).collect();
    let game_ids: Vec<String> = request
        .game_ids
        .into_iter()
        .map(|id| id.to_string())
        .collect();

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
    let mut game_files_updated = Vec::with_capacity(request.game_files.len());

    for game_file in request.game_files {
        let updated: GameFile = sqlx::query_as(
            "update game_files set byte_size = $1, path = $2, game_id = $3, platform_id = $4, deleted_at = $5, is_deleted = $6 where id = $7 returning *",
        )
        .bind(game_file.byte_size)
        .bind(game_file.path)
        .bind(game_file.game_id)
        .bind(game_file.platform_id)
        .bind(game_file.deleted_at)
        .bind(game_file.is_deleted)
        .bind(game_file.id)
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        game_files_updated.push(updated);
    }

    Ok(UpdateGameFilesResponse { game_files_updated })
}

pub async fn delete_game_files(
    db_pool: DbPool,
    request: DeleteGameFilesRequest,
) -> Result<DeleteGameFilesResponse, Status> {
    let ids: Vec<String> = request.ids.into_iter().map(|id| id.to_string()).collect();

    if ids.is_empty() {
        return Ok(DeleteGameFilesResponse {
            game_files_deleted: vec![],
        });
    }

    let mut builder = if request.blacklist_entries {
        QueryBuilder::<RetromDB>::new(
            "update game_files set is_deleted = 1, deleted_at = current_timestamp where id in (",
        )
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
