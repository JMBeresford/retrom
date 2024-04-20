use crate::routes::utils::define_route_handler;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
    Json, Router,
};
use db::{schema, Pool};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use library_manager::library::game_library::NewGameLibrary;
use std::{env, path::Path};
use tracing::{error, instrument};

pub fn populate_library() -> Router<Pool> {
    #[instrument(name = "POST /library/populate", skip_all)]
    async fn handler(State(pool): State<Pool>) -> Response {
        let content_dir = env::var("CONTENT_DIR").unwrap_or("./mock_content".to_string());

        let content_dir_path = Path::new(&content_dir);
        let library = match NewGameLibrary::from_content_dir(content_dir_path).await {
            Ok(library) => library,
            Err(why) => {
                error!("Could not generate library: {:?}", why);
                return (StatusCode::INTERNAL_SERVER_ERROR, why.to_string()).into_response();
            }
        };

        let mut conn = match pool.get().await {
            Ok(conn) => conn,
            Err(why) => {
                return (StatusCode::INTERNAL_SERVER_ERROR, why.to_string()).into_response()
            }
        };

        for platform in &library.new_platforms {
            platform
                .insert_into(schema::platforms::table)
                .execute(&mut conn)
                .await
                .expect("Could not insert platform");
        }

        for game in &library.new_games {
            game.insert_into(schema::games::table)
                .execute(&mut conn)
                .await
                .expect("Could not insert game");
        }

        for game_file in &library.new_game_files {
            game_file
                .insert_into(schema::game_files::table)
                .execute(&mut conn)
                .await
                .expect("Could not insert game file");
        }

        (StatusCode::OK, Json(library)).into_response()
    }

    define_route_handler("/populate", post(handler))
}
