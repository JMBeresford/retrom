use pbjson_types::Empty;
use retrom_codegen::retrom::services::{
    config::v1::config_service_client::ConfigServiceClient,
    library::v1::{
        library_service_server::LibraryService, AddGameRootDirectoryRequest,
        AddGameRootDirectoryResponse, AddLibraryRootDirectoryRequest,
        AddLibraryRootDirectoryResponse, AddPlatformRootDirectoryRequest,
        AddPlatformRootDirectoryResponse, BatchCreateGamesRequest, BatchCreateGamesResponse,
        BatchCreateLibrariesRequest, BatchCreateLibrariesResponse, BatchCreatePlatformsRequest,
        BatchCreatePlatformsResponse, BatchCreateRootDirectoriesRequest,
        BatchCreateRootDirectoriesResponse, BatchDeleteGameFilesRequest,
        BatchDeleteGameFilesResponse, BatchDeleteGamesRequest, BatchDeleteGamesResponse,
        BatchDeletePlatformsRequest, BatchDeletePlatformsResponse, BatchGetPlatformsRequest,
        BatchGetPlatformsResponse, BatchUpdatePlatformsRequest, BatchUpdatePlatformsResponse,
        CreateGameRequest, CreateLibraryRequest, CreatePlatformRequest, CreateRootDirectoryRequest,
        DeleteGameFileRequest, DeleteGameRequest, DeleteLibraryRequest,
        DeleteMissingEntriesRequest, DeleteMissingEntriesResponse, DeletePlatformRequest,
        DeleteRootDirectoryRequest, Game, GameFile, GetGameFileRequest, GetGameRequest,
        GetLibraryRequest, GetPlatformRequest, GetRootDirectoryRequest, Library,
        ListGameFilesRequest, ListGameFilesResponse, ListGamesRequest, ListGamesResponse,
        ListLibrariesRequest, ListLibrariesResponse, ListPlatformsRequest, ListPlatformsResponse,
        ListRootDirectoriesRequest, ListRootDirectoriesResponse, Platform, RootDirectory,
        ScanLibraryRequest, ScanLibraryResponse, UpdateGameFileRequest, UpdateGameRequest,
        UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse, UpdateLibraryRequest,
        UpdatePlatformRequest,
    },
    metadata::v1::metadata_service_client::MetadataServiceClient,
};
use retrom_db::DbPool;
use retrom_service_common::grpc_clients::{
    config_svc::get_config_svc_client, metadata_svc::get_metadata_svc_client,
};
use retrom_service_jobs::job_manager::JobManager;
use std::sync::Arc;
use tonic::{Request, Response, Status};

#[cfg(test)]
pub mod tests;

pub mod game_handlers;
pub mod library_handlers;
pub mod metadata_handlers;
pub mod platform_handlers;
pub mod root_directory_handlers;
pub mod router;
pub mod scan;
pub mod scan_handlers;

#[derive(Clone)]
pub struct LibraryServiceHandlers {
    pub db_pool: DbPool,
    pub job_manager: Arc<JobManager>,
    config_svc_client: ConfigServiceClient<tonic::transport::Channel>,
    metadata_svc_client: MetadataServiceClient<tonic::transport::Channel>,
}

impl LibraryServiceHandlers {
    pub fn new(db_pool: DbPool, job_manager: Arc<JobManager>) -> Self {
        Self {
            db_pool,
            job_manager,
            config_svc_client: get_config_svc_client(None),
            metadata_svc_client: get_metadata_svc_client(None),
        }
    }
}

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    #[tracing::instrument(skip(self))]
    async fn scan_library(
        &self,
        request: Request<ScanLibraryRequest>,
    ) -> Result<Response<ScanLibraryResponse>, Status> {
        scan_handlers::scan_library(self, request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        metadata_handlers::update_library_metadata(self, request)
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_missing_entries(
        &self,
        request: Request<DeleteMissingEntriesRequest>,
    ) -> Result<Response<DeleteMissingEntriesResponse>, Status> {
        library_handlers::delete_missing_entries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_library(
        &self,
        request: Request<GetLibraryRequest>,
    ) -> Result<Response<Library>, Status> {
        library_handlers::get_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn list_libraries(
        &self,
        request: Request<ListLibrariesRequest>,
    ) -> Result<Response<ListLibrariesResponse>, Status> {
        library_handlers::list_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_library(
        &self,
        request: Request<CreateLibraryRequest>,
    ) -> Result<Response<Library>, Status> {
        library_handlers::create_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequest>,
    ) -> Result<Response<Library>, Status> {
        library_handlers::update_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<Empty>, Status> {
        library_handlers::delete_library(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_create_libraries(
        &self,
        request: Request<BatchCreateLibrariesRequest>,
    ) -> Result<Response<BatchCreateLibrariesResponse>, Status> {
        library_handlers::batch_create_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_root_directory(
        &self,
        request: Request<GetRootDirectoryRequest>,
    ) -> Result<Response<RootDirectory>, Status> {
        root_directory_handlers::get_root_directory(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn list_root_directories(
        &self,
        request: Request<ListRootDirectoriesRequest>,
    ) -> Result<Response<ListRootDirectoriesResponse>, Status> {
        root_directory_handlers::list_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_root_directory(
        &self,
        request: Request<CreateRootDirectoryRequest>,
    ) -> Result<Response<RootDirectory>, Status> {
        root_directory_handlers::create_root_directory(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_root_directory(
        &self,
        request: Request<DeleteRootDirectoryRequest>,
    ) -> Result<Response<Empty>, Status> {
        root_directory_handlers::delete_root_directory(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_create_root_directories(
        &self,
        request: Request<BatchCreateRootDirectoriesRequest>,
    ) -> Result<Response<BatchCreateRootDirectoriesResponse>, Status> {
        root_directory_handlers::batch_create_root_directories(
            self.db_pool.clone(),
            request.into_inner(),
        )
        .await
        .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn add_library_root_directory(
        &self,
        request: Request<AddLibraryRootDirectoryRequest>,
    ) -> Result<Response<AddLibraryRootDirectoryResponse>, Status> {
        root_directory_handlers::add_library_root_directory(
            self.db_pool.clone(),
            request.into_inner(),
        )
        .await
        .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn add_platform_root_directory(
        &self,
        request: Request<AddPlatformRootDirectoryRequest>,
    ) -> Result<Response<AddPlatformRootDirectoryResponse>, Status> {
        root_directory_handlers::add_platform_root_directory(
            self.db_pool.clone(),
            request.into_inner(),
        )
        .await
        .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn add_game_root_directory(
        &self,
        request: Request<AddGameRootDirectoryRequest>,
    ) -> Result<Response<AddGameRootDirectoryResponse>, Status> {
        root_directory_handlers::add_game_root_directory(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_platform(
        &self,
        request: Request<GetPlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::get_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn list_platforms(
        &self,
        request: Request<ListPlatformsRequest>,
    ) -> Result<Response<ListPlatformsResponse>, Status> {
        platform_handlers::list_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_platform(
        &self,
        request: Request<CreatePlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::create_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_platform(
        &self,
        request: Request<DeletePlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::delete_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_platform(
        &self,
        request: Request<UpdatePlatformRequest>,
    ) -> Result<Response<Platform>, Status> {
        platform_handlers::update_platform(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_get_platforms(
        &self,
        request: Request<BatchGetPlatformsRequest>,
    ) -> Result<Response<BatchGetPlatformsResponse>, Status> {
        platform_handlers::batch_get_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_create_platforms(
        &self,
        request: Request<BatchCreatePlatformsRequest>,
    ) -> Result<Response<BatchCreatePlatformsResponse>, Status> {
        platform_handlers::batch_create_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_update_platforms(
        &self,
        request: Request<BatchUpdatePlatformsRequest>,
    ) -> Result<Response<BatchUpdatePlatformsResponse>, Status> {
        platform_handlers::batch_update_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_delete_platforms(
        &self,
        request: Request<BatchDeletePlatformsRequest>,
    ) -> Result<Response<BatchDeletePlatformsResponse>, Status> {
        platform_handlers::batch_delete_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_game(&self, request: Request<GetGameRequest>) -> Result<Response<Game>, Status> {
        game_handlers::get_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn list_games(
        &self,
        request: Request<ListGamesRequest>,
    ) -> Result<Response<ListGamesResponse>, Status> {
        game_handlers::list_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_game(
        &self,
        request: Request<CreateGameRequest>,
    ) -> Result<Response<Game>, Status> {
        game_handlers::create_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_game(
        &self,
        request: Request<DeleteGameRequest>,
    ) -> Result<Response<Game>, Status> {
        game_handlers::delete_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_game(
        &self,
        request: Request<UpdateGameRequest>,
    ) -> Result<Response<Game>, Status> {
        game_handlers::update_game(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_create_games(
        &self,
        request: Request<BatchCreateGamesRequest>,
    ) -> Result<Response<BatchCreateGamesResponse>, Status> {
        game_handlers::batch_create_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn batch_delete_games(
        &self,
        request: Request<BatchDeleteGamesRequest>,
    ) -> Result<Response<BatchDeleteGamesResponse>, Status> {
        game_handlers::batch_delete_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_game_file(
        &self,
        request: Request<GetGameFileRequest>,
    ) -> Result<Response<GameFile>, Status> {
        game_handlers::get_game_file(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn list_game_files(
        &self,
        request: Request<ListGameFilesRequest>,
    ) -> Result<Response<ListGameFilesResponse>, Status> {
        game_handlers::list_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_game_file(
        &self,
        request: Request<UpdateGameFileRequest>,
    ) -> Result<Response<GameFile>, Status> {
        game_handlers::update_game_file(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_game_file(
        &self,
        request: Request<DeleteGameFileRequest>,
    ) -> Result<Response<GameFile>, Status> {
        game_handlers::delete_game_file(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn batch_delete_game_files(
        &self,
        request: Request<BatchDeleteGameFilesRequest>,
    ) -> Result<Response<BatchDeleteGameFilesResponse>, Status> {
        game_handlers::batch_delete_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }
}
