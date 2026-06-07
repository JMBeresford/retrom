use retrom_codegen::retrom::services::{
    library::v1::{
        library_service_server::LibraryService, library_service_server::LibraryServiceServer,
        CreateGamesRequest, CreateGamesResponse, CreateLibrariesRequest, CreateLibrariesResponse,
        CreatePlatformsRequest, CreatePlatformsResponse, CreateRootDirectoriesRequest,
        CreateRootDirectoriesResponse, DeleteGameFilesRequest, DeleteGameFilesResponse,
        DeleteGamesRequest, DeleteGamesResponse, DeleteLibraryRequest, DeleteLibraryResponse,
        DeleteMissingEntriesRequest, DeleteMissingEntriesResponse, DeletePlatformsRequest,
        DeletePlatformsResponse, DeleteRootDirectoriesRequest, DeleteRootDirectoriesResponse,
        GetGameFilesRequest, GetGameFilesResponse, GetGamesRequest, GetGamesResponse,
        GetLibrariesRequest, GetLibrariesResponse, GetPlatformsRequest, GetPlatformsResponse,
        GetRootDirectoriesRequest, GetRootDirectoriesResponse, ScanLibraryRequest,
        ScanLibraryResponse, UpdateGameFilesRequest, UpdateGameFilesResponse, UpdateGamesRequest,
        UpdateGamesResponse, UpdateLibrariesRequest, UpdateLibrariesResponse,
        UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse, UpdatePlatformsRequest,
        UpdatePlatformsResponse, UpdateRootDirectoriesRequest, UpdateRootDirectoriesResponse,
    },
    metadata::v1::igdb_service_client::IgdbServiceClient,
};
use retrom_db::DbPool;
use retrom_service_jobs::job_manager::JobManager;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub mod game_handlers;
pub mod library_handlers;
pub mod metadata_handlers;
pub mod platform_handlers;
pub mod root_directory_handlers;
pub mod scan;
pub mod scan_handlers;

#[derive(Clone)]
pub struct LibraryServiceHandlers {
    pub db_pool: DbPool,
    pub job_manager: Arc<JobManager>,
    igdb_svc_client: IgdbServiceClient<tonic::transport::Channel>,
}

impl LibraryServiceHandlers {
    pub fn new(db_pool: DbPool, job_manager: Arc<JobManager>) -> Self {
        let igdb_svc_port = std::env::var("RETROM_METADATA_SERVICE_PORT")
            .ok()
            .and_then(|p| p.parse::<i32>().ok())
            .unwrap_or(5110);

        let igdb_svc_host = format!("http://[::1]:{igdb_svc_port}");

        let igdb_svc_transport = tonic::transport::Channel::from_shared(igdb_svc_host)
            .expect("Failed to create IgdbServiceClient with host {igdb_svc_host}")
            .connect_lazy();

        let igdb_svc_client = IgdbServiceClient::new(igdb_svc_transport);

        Self {
            db_pool,
            job_manager,
            igdb_svc_client,
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
        _request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        Err(Status::unimplemented(
            "UpdateLibraryMetadata is not implemented in sqlx migration groundwork",
        ))
    }

    async fn delete_library(
        &self,
        _request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        Err(Status::unimplemented(
            "DeleteLibrary is not implemented in sqlx migration groundwork",
        ))
    }

    async fn delete_missing_entries(
        &self,
        _request: Request<DeleteMissingEntriesRequest>,
    ) -> Result<Response<DeleteMissingEntriesResponse>, Status> {
        Err(Status::unimplemented(
            "DeleteMissingEntries is not implemented in sqlx migration groundwork",
        ))
    }

    async fn get_libraries(
        &self,
        request: Request<GetLibrariesRequest>,
    ) -> Result<Response<GetLibrariesResponse>, Status> {
        library_handlers::get_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_libraries(
        &self,
        request: Request<CreateLibrariesRequest>,
    ) -> Result<Response<CreateLibrariesResponse>, Status> {
        library_handlers::create_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_libraries(
        &self,
        request: Request<UpdateLibrariesRequest>,
    ) -> Result<Response<UpdateLibrariesResponse>, Status> {
        library_handlers::update_libraries(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_root_directories(
        &self,
        request: Request<GetRootDirectoriesRequest>,
    ) -> Result<Response<GetRootDirectoriesResponse>, Status> {
        root_directory_handlers::get_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_root_directories(
        &self,
        request: Request<CreateRootDirectoriesRequest>,
    ) -> Result<Response<CreateRootDirectoriesResponse>, Status> {
        root_directory_handlers::create_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_root_directories(
        &self,
        request: Request<UpdateRootDirectoriesRequest>,
    ) -> Result<Response<UpdateRootDirectoriesResponse>, Status> {
        root_directory_handlers::update_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_root_directories(
        &self,
        request: Request<DeleteRootDirectoriesRequest>,
    ) -> Result<Response<DeleteRootDirectoriesResponse>, Status> {
        root_directory_handlers::delete_root_directories(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_platforms(
        &self,
        request: Request<GetPlatformsRequest>,
    ) -> Result<Response<GetPlatformsResponse>, Status> {
        platform_handlers::get_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_platforms(
        &self,
        request: Request<CreatePlatformsRequest>,
    ) -> Result<Response<CreatePlatformsResponse>, Status> {
        platform_handlers::create_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        platform_handlers::delete_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn update_platforms(
        &self,
        request: Request<UpdatePlatformsRequest>,
    ) -> Result<Response<UpdatePlatformsResponse>, Status> {
        platform_handlers::update_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn get_games(
        &self,
        request: Request<GetGamesRequest>,
    ) -> Result<Response<GetGamesResponse>, Status> {
        game_handlers::get_games(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }

    async fn create_games(
        &self,
        request: Request<CreateGamesRequest>,
    ) -> Result<Response<CreateGamesResponse>, Status> {
        game_handlers::create_games(self.db_pool.clone(), request.into_inner())
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

/// Build an [`axum::Router`] that serves the library gRPC endpoints.
pub fn library_router(db_pool: DbPool) -> axum::Router {
    let job_manager = Arc::new(JobManager::new());
    let lib_handlers = LibraryServiceHandlers::new(db_pool, job_manager);
    let library_service = LibraryServiceServer::new(lib_handlers);

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(library_service);

    routes_builder.routes().into_axum_router()
}
