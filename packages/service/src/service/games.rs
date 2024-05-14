use db::{schema, Pool};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use generated::retrom::{
    self, game_service_server::GameService, GetGamesRequest, GetGamesResponse,
};
use std::sync::Arc;
use tonic::{Code, Request, Response, Status};

#[derive(Debug, Clone)]
pub struct GameServiceHandlers {
    pub db_pool: Arc<Pool>,
}

impl GameServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl GameService for GameServiceHandlers {
    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut query = schema::games::table
            .into_boxed()
            .select(retrom::Game::as_select());

        if !&request.ids.is_empty() {
            query = query.filter(schema::games::id.eq_any(&request.ids));
        }

        if !&request.platform_ids.is_empty() {
            query = query.filter(schema::games::platform_id.eq_any(&request.platform_ids));
        }

        let rows: Vec<retrom::Game> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let games_data: Vec<generated::retrom::Game> =
            rows.into_iter().map(|game| game.into()).collect();

        let mut metadata_data: Vec<retrom::GameMetadata> = vec![];
        let mut game_files_data: Vec<retrom::GameFile> = vec![];

        let game_ids: Vec<i32> = games_data.iter().map(|game| game.id).collect();

        if request.with_metadata() {
            let metadata_rows = schema::game_metadata::table
                .filter(schema::game_metadata::game_id.eq_any(&game_ids))
                .load::<retrom::GameMetadata>(&mut conn)
                .await;

            match metadata_rows {
                Ok(rows) => metadata_data.extend(rows),
                Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
            };
        }

        if request.with_files() {
            let game_files_rows = schema::game_files::table
                .filter(schema::game_files::game_id.eq_any(&game_ids))
                .load::<retrom::GameFile>(&mut conn)
                .await;

            match game_files_rows {
                Ok(rows) => game_files_data.extend(
                    rows.into_iter()
                        .map(|game_file| game_file.into())
                        .collect::<Vec<retrom::GameFile>>(),
                ),
                Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
            };
        }

        let response = GetGamesResponse {
            games: games_data,
            metadata: metadata_data,
            game_files: game_files_data,
        };

        Ok(Response::new(response))
    }
}
