use futures::future::join_all;
use retrom_codegen::retrom::services::library::v1::{
    AddGameRootDirectoryRequest, AddGameRootDirectoryResponse, BatchCreateGamesRequest,
    BatchCreateGamesResponse, BatchDeleteGameFilesRequest, BatchDeleteGameFilesResponse,
    BatchDeleteGamesRequest, BatchDeleteGamesResponse, CreateGameRequest, DeleteGameFileRequest,
    DeleteGameRequest, Game, GameFile, GameFileRow, GameRow, GetGameFileRequest, GetGameRequest,
    ListGameFilesRequest, ListGameFilesResponse, ListGamesRequest, ListGamesResponse,
    UpdateGameFileRequest, UpdateGameRequest,
};
use retrom_db::{DbPool, RetromDB};
use sqlx::{types::chrono, QueryBuilder};
use std::path::PathBuf;
use tonic::Status;

use crate::root_directory_handlers::add_game_root_directory;

fn game_row_to_game(row: GameRow, paths: Vec<String>, platforms: Vec<String>) -> Game {
    Game {
        id: row.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        is_deleted: row.is_deleted,
        third_party: row.third_party,
        steam_app_id: row.steam_app_id,
        paths,
        platforms,
    }
}

async fn get_game_paths(db_pool: &DbPool, game_id: &str) -> Result<Vec<String>, Status> {
    let paths: Vec<String> = QueryBuilder::new(
        r#"
        select rd.path from root_directories rd
        join game_root_directories grd on grd.root_directory_id = rd.id
        where grd.game_id =
        "#,
    )
    .push_bind(game_id)
    .build_query_scalar()
    .fetch_all(db_pool)
    .await
    .map_err(|e| Status::internal(e.to_string()))?;

    Ok(paths)
}

fn game_file_row_to_game_file(row: GameFileRow) -> GameFile {
    GameFile {
        id: row.id,
        game: row.game_id,
        platform: row.platform_id,
        byte_size: row.byte_size,
        path: row.path,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        is_deleted: row.is_deleted,
    }
}

pub async fn get_game(db_pool: DbPool, request: GetGameRequest) -> Result<Game, Status> {
    let game_id = request.id;

    let platforms: Vec<String> =
        QueryBuilder::new("select platform_id from game_platforms where game_id = ")
            .push_bind(&game_id)
            .build_query_scalar()
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    let paths = get_game_paths(&db_pool, &game_id).await?;

    QueryBuilder::new("select * from games where id = ")
        .push_bind(&game_id)
        .push(" and is_deleted = ")
        .push_bind(false)
        .push(" limit 1")
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))
        .map(|row: GameRow| game_row_to_game(row, paths, platforms))
}

pub async fn list_games(
    db_pool: DbPool,
    request: ListGamesRequest,
) -> Result<ListGamesResponse, Status> {
    let include_deleted = request.include_deleted.unwrap_or(false);
    let ids = request.ids;
    let platform_ids = request.platform_ids;
    let name = request.name;

    let mut games_builder = QueryBuilder::<RetromDB>::new("select id from games");
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

    if let Some(name) = name {
        if has_condition {
            games_builder.push(" and name like ");
        } else {
            games_builder.push(" where name like ");
        }
        games_builder.push_bind(format!("%{}%", name));
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

    let game_ids: Vec<String> = games_builder
        .build_query_scalar()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let games = join_all(game_ids.into_iter().map(|id| {
        let db_pool = db_pool.clone();
        async move { get_game(db_pool.clone(), GetGameRequest { id }).await }
    }))
    .await
    .into_iter()
    .map(|result| result.map_err(|e| Status::internal(e.to_string())))
    .collect::<Result<Vec<Game>, Status>>()?;

    Ok(ListGamesResponse { games })
}

pub async fn create_game(db_pool: DbPool, request: CreateGameRequest) -> Result<Game, Status> {
    let game = request
        .game
        .ok_or_else(|| Status::invalid_argument("Game must be provided"))?;

    if game.third_party && game.steam_app_id.is_none() {
        return Err(Status::invalid_argument(
            "Steam app ID must be provided for third-party games",
        ));
    }

    if !game.third_party && game.steam_app_id.is_some() {
        return Err(Status::invalid_argument(
            "Steam app ID cannot be provided for non-third-party games",
        ));
    }

    let mut builder =
        QueryBuilder::<RetromDB>::new("insert into games (id, third_party, steam_app_id) values ");

    builder.push_bind(uuid::Uuid::now_v7().to_string());
    builder.push_bind(game.third_party);
    builder.push_bind(&game.steam_app_id);

    builder.push(" returning *");

    let game_row: GameRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut builder = QueryBuilder::new("insert into game_platforms (game_id, platform_id) ");

    builder.push_values(&game.platforms, |mut row, platform_id| {
        row.push_bind(&game_row.id);
        row.push_bind(platform_id);
    });

    if !game.platforms.is_empty() {
        builder
            .build()
            .execute(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    };

    let paths = if !game.paths.is_empty() {
        let responses = join_all(game.paths.into_iter().map(|path| {
            let db_pool = db_pool.clone();
            let game_id = game_row.id.clone();

            async move {
                add_game_root_directory(db_pool, AddGameRootDirectoryRequest { game_id, path })
                    .await
            }
        }))
        .await
        .into_iter()
        .collect::<Result<Vec<AddGameRootDirectoryResponse>, Status>>()?;

        responses
            .into_iter()
            .filter_map(|r| r.root_directory.map(|rd| rd.path))
            .collect::<Vec<String>>()
    } else {
        vec![]
    };

    Ok(Game {
        id: game_row.id,
        created_at: game_row.created_at,
        updated_at: game_row.updated_at,
        deleted_at: game_row.deleted_at,
        is_deleted: game_row.is_deleted,
        third_party: game_row.third_party,
        steam_app_id: game_row.steam_app_id,
        paths,
        platforms: game.platforms,
    })
}

pub async fn update_game(db_pool: DbPool, request: UpdateGameRequest) -> Result<Game, Status> {
    let game = request
        .game
        .ok_or_else(|| Status::invalid_argument("Game must be provided"))?;

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if !game.platforms.is_empty() {
        let current_platforms: Vec<String> =
            QueryBuilder::new("select platform_id from game_platforms where game_id = ")
                .push_bind(&game.id)
                .build_query_scalar()
                .fetch_all(&mut *tx)
                .await
                .map_err(|e| Status::internal(e.to_string()))?;

        let platforms_to_add: Vec<String> = game
            .platforms
            .iter()
            .filter(|p| !current_platforms.contains(p))
            .cloned()
            .collect();

        QueryBuilder::new("insert into game_platforms (game_id, platform_id) ")
            .push_values(&platforms_to_add, |mut row, platform_id| {
                row.push_bind(&game.id);
                row.push_bind(platform_id);
            })
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let platforms_to_remove: Vec<String> = current_platforms
            .iter()
            .filter(|p| !game.platforms.contains(p))
            .cloned()
            .collect();

        let mut builder = QueryBuilder::new("delete from game_platforms where game_id = ");
        builder.push_bind(&game.id);
        builder.push(" and platform_id in (");

        let mut separated = builder.separated(", ");

        for platform_id in &platforms_to_remove {
            separated.push_bind(platform_id);
        }

        separated.push_unseparated(")");

        builder
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    if !game.paths.is_empty() {
        let current_paths = get_game_paths(&db_pool, &game.id).await?;

        let paths_to_add: Vec<String> = game
            .paths
            .iter()
            .filter(|p| !current_paths.contains(p))
            .cloned()
            .collect();

        QueryBuilder::new("insert into game_root_directories (game_id, path) ")
            .push_values(&paths_to_add, |mut row, path| {
                row.push_bind(&game.id);
                row.push_bind(path);
            })
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let paths_to_remove: Vec<String> = current_paths
            .iter()
            .filter(|p| !game.paths.contains(p))
            .cloned()
            .collect();

        let mut builder = QueryBuilder::new("delete from game_root_directories where game_id = ");
        builder.push_bind(&game.id);
        builder.push(" and path in (");

        let mut separated = builder.separated(", ");

        for path in &paths_to_remove {
            separated.push_bind(path);
        }

        separated.push_unseparated(")");

        builder
            .build()
            .execute(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
    }

    let mut builder = QueryBuilder::new("update games set steam_app_id = ");
    builder.push_bind(game.steam_app_id);
    builder.push(" where id = ");
    builder.push_bind(&game.id);
    builder.push(" returning *");

    builder
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    get_game(db_pool, GetGameRequest { id: game.id }).await
}

pub async fn delete_game(db_pool: DbPool, request: DeleteGameRequest) -> Result<Game, Status> {
    let id = request.id;
    let soft_delete = request.soft_delete;
    let delete_from_disk = request.delete_from_disk;

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let platforms: Vec<String> =
        QueryBuilder::new("select platform_id from game_platforms where game_id = ")
            .push_bind(&id)
            .build_query_scalar()
            .fetch_all(&db_pool)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

    let paths = get_game_paths(&db_pool, &id).await?;

    QueryBuilder::new("delete from game_files where game_id = ")
        .push_bind(&id)
        .build()
        .execute(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut builder = if soft_delete {
        let mut builder = QueryBuilder::<RetromDB>::new("update games set is_deleted = ");
        builder.push_bind(true);
        builder.push(", deleted_at = ");
        builder.push_bind(chrono::Utc::now());
        builder.push(" where id = ");
        builder.push_bind(&id);
        builder
    } else {
        let mut builder = QueryBuilder::<RetromDB>::new("delete from games where id = ");
        builder.push_bind(&id);
        builder
    };

    builder.push(" returning *");

    let game_row: GameRow = builder
        .build_query_as()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let delete_tasks = if delete_from_disk {
        paths
            .iter()
            .map(|path| {
                let path = PathBuf::from(path);

                async move {
                    if path.exists() {
                        if path.is_dir() {
                            tokio::fs::remove_dir_all(&path).await
                        } else {
                            tokio::fs::remove_file(&path).await
                        }
                    } else {
                        Ok(())
                    }
                }
            })
            .collect()
    } else {
        vec![]
    };

    join_all(delete_tasks)
        .await
        .into_iter()
        .collect::<Result<Vec<()>, std::io::Error>>()
        .map_err(|e| Status::internal(format!("Failed to delete game files from disk: {}", e)))?;

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let game = game_row_to_game(game_row, paths, platforms);

    Ok(game)
}

pub async fn batch_create_games(
    db_pool: DbPool,
    request: BatchCreateGamesRequest,
) -> Result<BatchCreateGamesResponse, Status> {
    if request.requests.is_empty() {
        return Err(Status::invalid_argument(
            "At least one request must be provided",
        ));
    }

    let games = join_all(request.requests.into_iter().map(|r| {
        let db_pool = db_pool.clone();
        async move { create_game(db_pool, r).await }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Game>, Status>>()?;

    Ok(BatchCreateGamesResponse { games })
}

pub async fn batch_delete_games(
    db_pool: DbPool,
    request: BatchDeleteGamesRequest,
) -> Result<BatchDeleteGamesResponse, Status> {
    if request.requests.is_empty() {
        return Err(Status::invalid_argument(
            "At least one request must be provided",
        ));
    }

    let games = join_all(request.requests.into_iter().map(|r| {
        let db_pool = db_pool.clone();
        async move { delete_game(db_pool, r).await }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<Game>, Status>>()?;

    Ok(BatchDeleteGamesResponse { games })
}

pub async fn get_game_file(
    db_pool: DbPool,
    request: GetGameFileRequest,
) -> Result<GameFile, Status> {
    let id = request.id;

    if id.is_empty() {
        return Err(Status::invalid_argument("Game file ID must be provided"));
    }

    let row: GameFileRow = QueryBuilder::new("select * from game_files where id = ")
        .push_bind(&id)
        .push(" and is_deleted = ")
        .push_bind(false)
        .push(" limit 1")
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(game_file_row_to_game_file(row))
}

pub async fn list_game_files(
    db_pool: DbPool,
    request: ListGameFilesRequest,
) -> Result<ListGameFilesResponse, Status> {
    let include_deleted = request.include_deleted();
    let ids = request.ids;
    let game_ids = request.game_ids;

    let mut builder = QueryBuilder::new("select * from game_files");
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

    let rows: Vec<GameFileRow> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let game_files = rows
        .into_iter()
        .map(game_file_row_to_game_file)
        .collect::<Vec<GameFile>>();

    Ok(ListGameFilesResponse { game_files })
}

pub async fn update_game_file(
    db_pool: DbPool,
    request: UpdateGameFileRequest,
) -> Result<GameFile, Status> {
    let game_file = request
        .game_file
        .ok_or_else(|| Status::invalid_argument("Game file must be provided"))?;

    let current_path: String = QueryBuilder::new("select path from game_files where id = ")
        .push_bind(&game_file.id)
        .build_query_scalar()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let current_file_path = PathBuf::from(&current_path);
    let next_file_path = PathBuf::from(&game_file.path);

    let is_rename = current_file_path != next_file_path && current_file_path.exists();

    if is_rename {
        if current_file_path.parent() != next_file_path.parent() {
            return Err(Status::invalid_argument(
                "Cannot move game file to a different directory via UpdateGameFile.",
            ));
        }

        tokio::fs::rename(&current_file_path, &next_file_path)
            .await
            .map_err(|e| {
                Status::internal(format!(
                    "Failed to rename game file from {} to {}: {}",
                    current_file_path.display(),
                    next_file_path.display(),
                    e
                ))
            })?;
    }

    let mut builder = QueryBuilder::new("update game_files set byte_size = ");
    builder.push_bind(game_file.byte_size);
    builder.push(", path = ");
    builder.push_bind(game_file.path);
    builder.push(", game = ");
    builder.push_bind(game_file.game);
    builder.push(", platform = ");
    builder.push_bind(game_file.platform);
    builder.push(", deleted_at = ");
    builder.push_bind(game_file.deleted_at);
    builder.push(", is_deleted = ");
    builder.push_bind(game_file.is_deleted);
    builder.push(" where id = ");
    builder.push_bind(game_file.id);
    builder.push(" returning *");

    let row: GameFileRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let game_file = game_file_row_to_game_file(row);

    Ok(game_file)
}

pub async fn delete_game_file(
    db_pool: DbPool,
    request: DeleteGameFileRequest,
) -> Result<GameFile, Status> {
    let id = request.id;
    let soft_delete = request.soft_delete;
    let delete_from_disk = request.delete_from_disk;

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let row: GameFileRow = if soft_delete {
        QueryBuilder::new("update game_files set is_deleted = ")
            .push_bind(true)
            .push(", deleted_at = current_timestamp where id = ")
            .push_bind(&id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    } else {
        QueryBuilder::new("delete from game_files where id = ")
            .push_bind(&id)
            .push(" returning *")
            .build_query_as()
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| Status::internal(e.to_string()))?
    };

    let game_file = game_file_row_to_game_file(row);

    if delete_from_disk {
        let file_path = PathBuf::from(&game_file.path);
        if file_path.exists() {
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

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(game_file)
}

pub async fn batch_delete_game_files(
    db_pool: DbPool,
    request: BatchDeleteGameFilesRequest,
) -> Result<BatchDeleteGameFilesResponse, Status> {
    let requests = request.requests;

    if requests.is_empty() {
        return Err(Status::invalid_argument(
            "At least one deletion request must be provided",
        ));
    }

    let game_files = join_all(requests.into_iter().map(|r| {
        let db_pool = db_pool.clone();
        async move { delete_game_file(db_pool, r).await }
    }))
    .await
    .into_iter()
    .collect::<Result<Vec<GameFile>, Status>>()?;

    Ok(BatchDeleteGameFilesResponse { game_files })
}
