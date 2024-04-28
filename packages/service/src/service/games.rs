use db::{
    models::{game::GameRow, game_file::GameFileRow, metadata::MetadataRow, IntoMessages},
    schema, Pool,
};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use generated::retrom::{
    self, game_service_server::GameService, GetGamesRequest, GetGamesResponse,
};
use std::sync::Arc;
use tonic::{Code, Request, Response, Status};
use uuid::Uuid;

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
            .select(GameRow::as_select());

        if !&request.ids.is_empty() {
            let ids = request
                .ids
                .iter()
                .filter_map(|id| match Uuid::parse_str(id) {
                    Ok(id) => Some(id),
                    Err(why) => {
                        tracing::error!("Could not parse UUID: {}", why);
                        None
                    }
                })
                .collect::<Vec<Uuid>>();

            query = query.filter(schema::games::id.eq_any(ids));
        }

        if !&request.platform_ids.is_empty() {
            let platform_ids = request
                .platform_ids
                .iter()
                .filter_map(|id| match Uuid::parse_str(id) {
                    Ok(id) => Some(id),
                    Err(why) => {
                        tracing::error!("Could not parse UUID: {}", why);
                        None
                    }
                })
                .collect::<Vec<Uuid>>();
            query = query.filter(schema::games::platform_id.eq_any(platform_ids));
        }

        let rows: Vec<GameRow> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let games_data: Vec<generated::retrom::Game> =
            rows.into_iter().map(|game| game.into()).collect();

        let mut metadata_data: Vec<retrom::Metadata> = vec![];
        let mut game_files_data: Vec<retrom::GameFile> = vec![];

        let game_ids = games_data
            .iter()
            .map(|game| Uuid::parse_str(&game.id).unwrap())
            .collect::<Vec<Uuid>>();

        if request.with_metadata() {
            let metadata_rows = schema::metadata::table
                .filter(schema::metadata::game_id.eq_any(&game_ids))
                .load::<MetadataRow>(&mut conn)
                .await;

            match metadata_rows {
                Ok(rows) => metadata_data.extend(MetadataRow::into_messages(rows)),
                Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
            };
        }

        if request.with_files() {
            let game_files_rows = schema::game_files::table
                .filter(schema::game_files::game_id.eq_any(&game_ids))
                .load::<GameFileRow>(&mut conn)
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
