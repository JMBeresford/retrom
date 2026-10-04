use pbjson_types::Empty;
use retrom_codegen::retrom::services::library::v1::{
    library_service_server::LibraryService, BatchGetPlatformsRequest, BatchGetPlatformsResponse,
    CreateGameRequest, CreateLibraryRequest, CreatePlatformRequest, DeleteGameRequest,
    DeleteLibraryRequest, DeleteMissingEntriesRequest, DeleteMissingEntriesResponse,
    DeletePlatformRequest, Game, GetGameRequest, GetLibraryRequest, GetPlatformRequest, Library,
    ListGamesRequest, ListGamesResponse, ListLibrariesRequest, ListLibrariesResponse,
    ListPlatformsRequest, ListPlatformsResponse, Platform, ScanLibraryRequest, ScanLibraryResponse,
    UpdateGameRequest, UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse,
    UpdateLibraryRequest, UpdatePlatformRequest,
};
use retrom_db::DbPool;
use retrom_service_common::grpc_clients::{
    files_svc::{get_file_svc_client, CommonFileServiceClient},
    metadata_svc::{get_metadata_svc_client, CommonMetadataServiceClient},
};
use retrom_service_jobs::job_manager::JobManager;
use std::sync::Arc;
use tonic::{Request, Response, Status};

#[cfg(test)]
pub mod tests;

pub(crate) mod game_handlers;
pub(crate) mod library_handlers;
pub(crate) mod metadata_handlers;
pub(crate) mod platform_handlers;
pub mod router;
pub(crate) mod scan;
pub(crate) mod scan_handlers;

#[derive(Clone)]
pub struct LibraryServiceHandlers {
    pub db_pool: DbPool,
    pub job_manager: Arc<JobManager>,
    metadata_svc_client: CommonMetadataServiceClient,
    file_svc_client: CommonFileServiceClient,
}

impl LibraryServiceHandlers {
    pub fn new(db_pool: DbPool, job_manager: Arc<JobManager>) -> Self {
        Self {
            db_pool,
            job_manager,
            metadata_svc_client: get_metadata_svc_client(None),
            file_svc_client: get_file_svc_client(None),
        }
    }
}

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    async fn scan_library(
        &self,
        request: Request<ScanLibraryRequest>,
    ) -> Result<Response<ScanLibraryResponse>, Status> {
        scan_handlers::scan_library(self, request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        metadata_handlers::update_library_metadata(self, request)
            .await
            .map(Response::new)
    }

    async fn delete_missing_entries(
        &self,
        request: Request<DeleteMissingEntriesRequest>,
    ) -> Result<Response<DeleteMissingEntriesResponse>, Status> {
        library_handlers::delete_missing_entries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_library(
        &self,
        request: Request<GetLibraryRequest>,
    ) -> Result<Response<Library>, Status> {
        library_handlers::get_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn list_libraries(
        &self,
        request: Request<ListLibrariesRequest>,
    ) -> Result<Response<ListLibrariesResponse>, Status> {
        library_handlers::list_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_library(
        &self,
        request: Request<CreateLibraryRequest>,
    ) -> Result<Response<Library>, Status> {
        library_handlers::create_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequest>,
    ) -> Result<Response<Library>, Status> {
        library_handlers::update_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<Empty>, Status> {
        library_handlers::delete_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_platform(
        &self,
        request: Request<GetPlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::get_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn list_platforms(
        &self,
        request: Request<ListPlatformsRequest>,
    ) -> Result<Response<ListPlatformsResponse>, Status> {
        platform_handlers::list_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_platform(
        &self,
        request: Request<CreatePlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::create_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_platform(
        &self,
        request: Request<DeletePlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::delete_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_platform(
        &self,
        request: Request<UpdatePlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::update_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn batch_get_platforms(
        &self,
        request: Request<BatchGetPlatformsRequest>,
    ) -> Result<Response<BatchGetPlatformsResponse>, Status> {
        platform_handlers::batch_get_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_game(&self, request: Request<GetGameRequest>) -> Result<Response<Game>, Status> {
        game_handlers::get_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn list_games(
        &self,
        request: Request<ListGamesRequest>,
    ) -> Result<Response<ListGamesResponse>, Status> {
        game_handlers::list_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_game(
        &self,
        request: Request<CreateGameRequest>,
    ) -> Result<Response<Game>, Status> {
        game_handlers::create_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_game(
        &self,
        request: Request<DeleteGameRequest>,
    ) -> Result<Response<Game>, Status> {
        game_handlers::delete_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_game(
        &self,
        request: Request<UpdateGameRequest>,
    ) -> Result<Response<Game>, Status> {
        game_handlers::update_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }
}
