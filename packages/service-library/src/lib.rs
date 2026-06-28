use retrom_codegen::retrom::services::{
    config::v1::config_service_client::ConfigServiceClient,
    library::v1::{
        library_service_server::LibraryService, AddGameRootDirectoryRequest,
        AddGameRootDirectoryResponse, AddLibraryRootDirectoryRequest,
        AddLibraryRootDirectoryResponse, AddPlatformRootDirectoryRequest,
        AddPlatformRootDirectoryResponse, CreateGamesRequest, CreateGamesResponse,
        CreateLibrariesRequest, CreateLibrariesResponse, CreatePlatformsRequest,
        CreatePlatformsResponse, CreateRootDirectoriesRequest, CreateRootDirectoriesResponse,
        CreateRootDirectoryRequest, CreateRootDirectoryResponse, DeleteGameFilesRequest,
        DeleteGameFilesResponse, DeleteGamesRequest, DeleteGamesResponse, DeleteLibraryRequest,
        DeleteLibraryResponse, DeleteMissingEntriesRequest, DeleteMissingEntriesResponse,
        DeletePlatformsRequest, DeletePlatformsResponse, DeleteRootDirectoriesRequest,
        DeleteRootDirectoriesResponse, GetGameFilesRequest, GetGameFilesResponse, GetGamesRequest,
        GetGamesResponse, GetLibrariesRequest, GetLibrariesResponse, GetPlatformsRequest,
        GetPlatformsResponse, GetRootDirectoriesRequest, GetRootDirectoriesResponse,
        ScanLibraryRequest, ScanLibraryResponse, UpdateGameFilesRequest, UpdateGameFilesResponse,
        UpdateGamesRequest, UpdateGamesResponse, UpdateLibrariesRequest, UpdateLibrariesResponse,
        UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse, UpdatePlatformsRequest,
        UpdatePlatformsResponse, UpdateRootDirectoriesRequest, UpdateRootDirectoriesResponse,
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
            metadata_svc_client: get_metadata_svc_client(),
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
    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        library_handlers::delete_library(self.db_pool.clone(), request.into_inner())
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
    async fn get_libraries(
        &self,
        request: Request<GetLibrariesRequest>,
    ) -> Result<Response<GetLibrariesResponse>, Status> {
        library_handlers::get_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_libraries(
        &self,
        request: Request<CreateLibrariesRequest>,
    ) -> Result<Response<CreateLibrariesResponse>, Status> {
        library_handlers::create_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_libraries(
        &self,
        request: Request<UpdateLibrariesRequest>,
    ) -> Result<Response<UpdateLibrariesResponse>, Status> {
        library_handlers::update_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_root_directories(
        &self,
        request: Request<GetRootDirectoriesRequest>,
    ) -> Result<Response<GetRootDirectoriesResponse>, Status> {
        root_directory_handlers::get_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_root_directory(
        &self,
        request: Request<CreateRootDirectoryRequest>,
    ) -> Result<Response<CreateRootDirectoryResponse>, Status> {
        root_directory_handlers::create_root_directory(&self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_root_directories(
        &self,
        request: Request<CreateRootDirectoriesRequest>,
    ) -> Result<Response<CreateRootDirectoriesResponse>, Status> {
        root_directory_handlers::create_root_directories(
            &self.db_pool.clone(),
            request.into_inner(),
        )
        .await
        .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_root_directories(
        &self,
        request: Request<UpdateRootDirectoriesRequest>,
    ) -> Result<Response<UpdateRootDirectoriesResponse>, Status> {
        root_directory_handlers::update_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_root_directories(
        &self,
        request: Request<DeleteRootDirectoriesRequest>,
    ) -> Result<Response<DeleteRootDirectoriesResponse>, Status> {
        root_directory_handlers::delete_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn add_library_root_directory(
        &self,
        request: Request<AddLibraryRootDirectoryRequest>,
    ) -> Result<Response<AddLibraryRootDirectoryResponse>, Status> {
        root_directory_handlers::add_library_root_directory(
            &self.db_pool.clone(),
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
            &self.db_pool.clone(),
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
        root_directory_handlers::add_game_root_directory(
            &self.db_pool.clone(),
            request.into_inner(),
        )
        .await
        .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_platforms(
        &self,
        request: Request<GetPlatformsRequest>,
    ) -> Result<Response<GetPlatformsResponse>, Status> {
        platform_handlers::get_platforms(
            self.db_pool.clone(),
            request.into_inner(),
            self.config_svc_client.clone(),
        )
        .await
        .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_platforms(
        &self,
        request: Request<CreatePlatformsRequest>,
    ) -> Result<Response<CreatePlatformsResponse>, Status> {
        platform_handlers::create_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        platform_handlers::delete_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_platforms(
        &self,
        request: Request<UpdatePlatformsRequest>,
    ) -> Result<Response<UpdatePlatformsResponse>, Status> {
        platform_handlers::update_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        game_handlers::get_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn create_games(
        &self,
        request: Request<CreateGamesRequest>,
    ) -> Result<Response<CreateGamesResponse>, Status> {
        game_handlers::create_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_games(
        &self,
        request: Request<DeleteGamesRequest>,
    ) -> Result<Response<DeleteGamesResponse>, Status> {
        game_handlers::delete_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_games(
        &self,
        request: Request<UpdateGamesRequest>,
    ) -> Result<Response<UpdateGamesResponse>, Status> {
        game_handlers::update_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn get_game_files(
        &self,
        request: Request<GetGameFilesRequest>,
    ) -> Result<Response<GetGameFilesResponse>, Status> {
        game_handlers::get_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn delete_game_files(
        &self,
        request: Request<DeleteGameFilesRequest>,
    ) -> Result<Response<DeleteGameFilesResponse>, Status> {
        game_handlers::delete_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    #[tracing::instrument(skip(self))]
    async fn update_game_files(
        &self,
        request: Request<UpdateGameFilesRequest>,
    ) -> Result<Response<UpdateGameFilesResponse>, Status> {
        game_handlers::update_game_files(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }
}
