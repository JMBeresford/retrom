use retrom_codegen::retrom::services::library::v1::{
    CreateGameRequest, DeleteGameRequest, Game, GameRow, GetGameRequest, ListGamesRequest,
    ListGamesResponse, UpdateGameRequest,
};
use retrom_db::{page_cursor::PageCursor, DbPool};
use serde::{Deserialize, Serialize};
use sqlx::{types::chrono, QueryBuilder};
use std::{path::PathBuf, sync::OnceLock};
use tonic::Status;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
struct GameQueryFilter {
    parent_id: Option<String>,
    include_deleted: bool,
    title: Option<String>,
}

type GameCursor = PageCursor<GameQueryFilter>;

static NAME_MATCH_ROUTER: OnceLock<matchit::Router<&'static str>> = OnceLock::new();

fn get_name_matcher() -> &'static matchit::Router<&'static str> {
    NAME_MATCH_ROUTER.get_or_init(|| {
        let mut router = matchit::Router::new();
        router
            .insert("games/{game_id}", "Game handler")
            .expect("Failed to insert game route");

        router
            .insert("platforms/{platform_id}", "Platform handler")
            .expect("Failed to insert platform route");

        router
            .insert("files/{file_id}", "Files handler")
            .expect("Failed to insert files route");

        router
    })
}

fn match_game_id(name: &str) -> Result<String, Status> {
    let game_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("game_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid game name"))?;

    match game_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Game ID not found in name: {name}"
        ))),
    }
}

fn match_platform_id(name: &str) -> Result<String, Status> {
    let platform_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("platform_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid platform name"))?;

    match platform_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "Platform ID not found in name: {name}"
        ))),
    }
}

fn match_file_id(name: &str) -> Result<String, Status> {
    let file_id = get_name_matcher()
        .at(name)
        .map(|matched| matched.params.get("file_id").map(|s| s.to_string()))
        .map_err(|_| Status::invalid_argument("Invalid file name"))?;

    match file_id {
        Some(id) => Ok(id),
        None => Err(Status::invalid_argument(format!(
            "File ID not found in name: {name}"
        ))),
    }
}

fn game_row_to_game(row: GameRow) -> Game {
    Game {
        name: format!("games/{}", row.id),
        parent: format!("platforms/{}", row.platform_id),
        file_root: format!("files/{}", row.file_root_id),
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        is_deleted: row.is_deleted,
        third_party: row.third_party,
        steam_app_id: row.steam_app_id,
    }
}

pub async fn get_game(db_pool: DbPool, request: GetGameRequest) -> Result<Game, Status> {
    let game_id = match_game_id(&request.name)?;

    let row: Option<GameRow> = QueryBuilder::new("select * from games where id = ")
        .push_bind(&game_id)
        .push(" and is_deleted = ")
        .push_bind(false)
        .push(" limit 1")
        .build_query_as()
        .fetch_optional(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(row
        .map(game_row_to_game)
        .ok_or_else(|| Status::not_found(format!("Game with ID {} not found", game_id)))?)
}

pub async fn list_games(
    db_pool: DbPool,
    request: ListGamesRequest,
) -> Result<ListGamesResponse, Status> {
    let cursor = match GameCursor::deserialize(request.page_token()) {
        Some(existing_token) => existing_token,
        None => {
            let parsed_limit = match request.page_size() {
                0 => 250, // Default page size
                n if n < 0 => {
                    return Err(Status::invalid_argument("Page size must be non-negative"))
                }
                n if n > 1000 => 1000, // Max page size
                n => n as u32,
            };

            let parsed_parent_id = if let Some(ref parent) = request.parent {
                Some(match_platform_id(parent)?)
            } else {
                None
            };

            let include_deleted = request.include_deleted();
            let title = request.title;

            let initial_filter = GameQueryFilter {
                parent_id: parsed_parent_id,
                include_deleted,
                title,
            };

            GameCursor {
                offset: 0,
                page_size: parsed_limit,
                filter: initial_filter,
            }
        }
    };

    let current_filter = cursor.filter.clone();
    let query_limit = cursor.page_size + 1; // Fetch one extra to determine if there's a next page

    let mut builder = QueryBuilder::new("select * from games where id is not null ");
    if let Some(ref parent_id) = current_filter.parent_id {
        builder.push(" and platform_id = ");
        builder.push_bind(parent_id);
    }

    builder.push(" and is_deleted = ");
    builder.push_bind(current_filter.include_deleted);

    if let Some(ref title) = current_filter.title {
        builder.push(" and lower(title) like ");
        builder.push_bind(format!("%{}%", title.to_lowercase()));
    }

    builder.push("limit ");
    builder.push_bind(query_limit);
    builder.push(" offset ");
    builder.push_bind(cursor.offset);

    let rows: Vec<GameRow> = builder
        .build_query_as()
        .fetch_all(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut games = Vec::new();
    let num_rows_to_process = std::cmp::min(rows.len(), cursor.page_size as usize);

    let next_page_token = if rows.len() > cursor.page_size as usize {
        let next_cursor = GameCursor {
            offset: cursor.offset + cursor.page_size as u32,
            page_size: cursor.page_size,
            filter: cursor.filter,
        };

        Some(next_cursor.serialize())
    } else {
        None
    };

    for game_row in rows.into_iter().take(num_rows_to_process) {
        games.push(game_row_to_game(game_row));
    }

    Ok(ListGamesResponse {
        games,
        next_page_token,
    })
}

pub async fn create_game(db_pool: DbPool, request: CreateGameRequest) -> Result<Game, Status> {
    let game = request
        .game
        .ok_or_else(|| Status::invalid_argument("Game must be provided"))?;

    let platform_id = match_platform_id(&game.parent)?;
    let file_root_id = match_file_id(&game.file_root)?;

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

    let mut builder = QueryBuilder::new(
        r#"
        insert into games (
            id,
            platform_id,
            file_root_id,
            third_party,
            steam_app_id
        ) values (
        "#,
    );

    let mut separated = builder.separated(", ");
    separated.push_bind(uuid::Uuid::now_v7().to_string());
    separated.push_bind(platform_id);
    separated.push_bind(file_root_id);
    separated.push_bind(game.third_party);
    separated.push_bind(&game.steam_app_id);

    builder.push(")");

    builder.push(" returning *");

    let game_row: GameRow = builder
        .build_query_as()
        .fetch_one(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    Ok(game_row_to_game(game_row))
}

pub async fn update_game(_db_pool: DbPool, request: UpdateGameRequest) -> Result<Game, Status> {
    let game = request
        .game
        .ok_or_else(|| Status::invalid_argument("Game must be provided"))?;

    // Update is currently a no-op since we don't have any mutable fields in the Game struct.
    Ok(game)
}

pub async fn delete_game(db_pool: DbPool, request: DeleteGameRequest) -> Result<Game, Status> {
    let game_id = match_game_id(&request.name)?;
    let soft_delete = request.soft_delete();
    let delete_from_disk = request.delete_from_disk();

    let mut tx = db_pool
        .begin()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let mut builder = if soft_delete {
        let mut builder = QueryBuilder::new("update games set is_deleted = ");
        builder.push_bind(true);
        builder.push(", deleted_at = ");
        builder.push_bind(chrono::Utc::now());
        builder.push(" where id = ");
        builder.push_bind(&game_id);
        builder
    } else {
        let mut builder = QueryBuilder::new("delete from games where id = ");
        builder.push_bind(&game_id);
        builder
    };

    builder.push(" returning *");

    let game_row: GameRow = builder
        .build_query_as()
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    if delete_from_disk {
        let path: Option<String> = QueryBuilder::new(
            r#"
            select f.absolute_path from games g
            join files f on f.id = g.file_root_id
            where g.id =
        "#,
        )
        .push_bind(&game_id)
        .push(" limit 1")
        .build_query_scalar()
        .fetch_optional(&db_pool)
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

        let path = match path {
            Some(p) => PathBuf::from(p),
            None => {
                return Err(Status::not_found(format!(
                    "No file root found for game with ID: {}",
                    game_id
                )))
            }
        };

        if path.exists() {
            if path.is_dir() {
                tokio::fs::remove_dir_all(&path).await.map_err(|e| {
                    Status::internal(format!(
                        "Failed to remove game directory {} from disk: {}",
                        path.display(),
                        e
                    ))
                })?;
            } else {
                tokio::fs::remove_file(&path).await.map_err(|e| {
                    Status::internal(format!(
                        "Failed to remove game file {} from disk: {}",
                        path.display(),
                        e
                    ))
                })?;
            }
        }
    }

    tx.commit()
        .await
        .map_err(|e| Status::internal(e.to_string()))?;

    let game = game_row_to_game(game_row);

    Ok(game)
}
