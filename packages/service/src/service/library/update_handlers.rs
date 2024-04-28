use db::{
    models::{
        game::GameRow, game_file::GameFileRow, platform::PlatformRow, FromMessages, IntoMessages,
    },
    schema,
};
use diesel::prelude::*;
use diesel_async::{pooled_connection::bb8::PooledConnection, AsyncPgConnection, RunQueryDsl};
use generated::retrom::UpdateLibraryResponse;
use library_manager::library::game_library::GameLibrary;
use tracing::error;

pub async fn update_library(
    conn: &mut PooledConnection<'_, AsyncPgConnection>,
    library: GameLibrary,
) -> Result<UpdateLibraryResponse, diesel::result::Error> {
    let mut response = UpdateLibraryResponse {
        platforms_populated: vec![],
        games_populated: vec![],
        game_files_populated: vec![],
    };

    let platforms_to_insert = PlatformRow::from_messages(library.platforms);
    let platform_update_res = match diesel::insert_into(schema::platforms::table)
        .values(platforms_to_insert)
        .on_conflict_do_nothing()
        .get_results::<PlatformRow>(conn)
        .await
        .optional()
    {
        Ok(platforms) => platforms,
        Err(e) => {
            error!("Failed to insert platforms: {}", e);
            return Err(e);
        }
    };

    if let Some(platforms) = platform_update_res {
        response.platforms_populated = PlatformRow::into_messages(platforms);
    }

    let games_to_insert = GameRow::from_messages(library.games);
    let game_update_res = match diesel::insert_into(schema::games::table)
        .values(games_to_insert)
        .on_conflict_do_nothing()
        .get_results::<GameRow>(conn)
        .await
        .optional()
    {
        Ok(games) => games,
        Err(e) => {
            error!("Failed to insert games: {}", e);
            return Err(e);
        }
    };

    if let Some(games) = game_update_res {
        response.games_populated = GameRow::into_messages(games);
    }

    let game_files_to_insert = GameFileRow::from_messages(library.game_files);
    let game_files_update_res = match diesel::insert_into(schema::game_files::table)
        .values(game_files_to_insert)
        .on_conflict_do_nothing()
        .get_results::<GameFileRow>(conn)
        .await
        .optional()
    {
        Ok(game_files) => game_files,
        Err(e) => {
            error!("Failed to insert game files: {}", e);
            return Err(e);
        }
    };

    if let Some(game_files) = game_files_update_res {
        response.game_files_populated = GameFileRow::into_messages(game_files);
    }

    Ok(response)
}

pub async fn force_update_library(
    conn: &mut PooledConnection<'_, AsyncPgConnection>,
    library: GameLibrary,
) -> Result<UpdateLibraryResponse, diesel::result::Error> {
    let mut response = UpdateLibraryResponse {
        platforms_populated: vec![],
        games_populated: vec![],
        game_files_populated: vec![],
    };

    for platform in library.platforms.into_iter() {
        let platform_row = PlatformRow::from(platform);
        let platform_insert_res = diesel::insert_into(schema::platforms::table)
            .values(&platform_row)
            .on_conflict(schema::platforms::id)
            .do_update()
            .set(&platform_row)
            .get_result::<PlatformRow>(conn)
            .await;

        match platform_insert_res {
            Ok(platform) => response.platforms_populated.push(platform.into()),
            Err(e) => {
                error!("Failed to insert platform: {}", e);
                return Err(e);
            }
        }
    }

    for game in library.games.into_iter() {
        let game_row = GameRow::from(game);
        let game_insert_res = diesel::insert_into(schema::games::table)
            .values(&game_row)
            .on_conflict(schema::games::id)
            .do_update()
            .set(&game_row)
            .get_result::<GameRow>(conn)
            .await;

        match game_insert_res {
            Ok(game) => response.games_populated.push(game.into()),
            Err(e) => {
                error!("Failed to insert game: {}", e);
                return Err(e);
            }
        }
    }

    for game_file in library.game_files.into_iter() {
        let game_file_row = GameFileRow::from(game_file);
        let game_file_insert_res = diesel::insert_into(schema::game_files::table)
            .values(&game_file_row)
            .on_conflict(schema::game_files::id)
            .do_update()
            .set(&game_file_row)
            .get_result::<GameFileRow>(conn)
            .await;

        match game_file_insert_res {
            Ok(game_file) => response.game_files_populated.push(game_file.into()),
            Err(e) => {
                error!("Failed to insert game file: {}", e);
                return Err(e);
            }
        }
    }

    Ok(response)
}
