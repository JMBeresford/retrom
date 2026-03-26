use retrom_codegen::retrom::{
    game_service_server::GameService, DeleteGameFilesRequest, DeleteGameFilesResponse,
    DeleteGamesRequest, DeleteGamesResponse, GetGameFilesRequest, GetGameFilesResponse,
    GetGamesRequest, GetGamesResponse, UpdateGameFilesRequest, UpdateGameFilesResponse,
    UpdateGamesRequest, UpdateGamesResponse,
};
use retrom_db::Pool;
use std::sync::Arc;
use tonic::{Request, Response, Status};

use crate::library::game_handlers;

#[derive(Clone)]
pub struct GameServiceHandlers {
    pub db_pool: Arc<Pool>,
}

impl GameServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

/// Forwarding stub — all RPCs delegate to `retrom.services.library.v1.LibraryService`
/// equivalents in [`crate::library::game_handlers`].
#[tonic::async_trait]
impl GameService for GameServiceHandlers {
    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        game_handlers::get_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_games(
        &self,
        request: Request<DeleteGamesRequest>,
    ) -> Result<Response<DeleteGamesResponse>, Status> {
        game_handlers::delete_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_games(
        &self,
        request: Request<UpdateGamesRequest>,
    ) -> Result<Response<UpdateGamesResponse>, Status> {
        game_handlers::update_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_game_files(
        &self,
        request: Request<GetGameFilesRequest>,
    ) -> Result<Response<GetGameFilesResponse>, Status> {
        game_handlers::get_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_game_files(
        &self,
        request: Request<DeleteGameFilesRequest>,
    ) -> Result<Response<DeleteGameFilesResponse>, Status> {
        game_handlers::delete_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_game_files(
        &self,
        request: Request<UpdateGameFilesRequest>,
    ) -> Result<Response<UpdateGameFilesResponse>, Status> {
        game_handlers::update_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }
}
