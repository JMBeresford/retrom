use crate::job_manager::JobManager;
use retrom_codegen::retrom::{
    library_service_server::LibraryService, DeleteLibraryRequest, DeleteLibraryResponse,
    DeleteMissingEntriesRequest, DeleteMissingEntriesResponse, UpdateLibraryMetadataRequest,
    UpdateLibraryMetadataResponse, UpdateLibraryRequest, UpdateLibraryResponse,
};
use retrom_db::Pool;
use retrom_service_common::{
    config::ServerConfigManager,
    metadata_providers::{igdb::provider::IGDBProvider, steam::provider::SteamWebApiProvider},
};
use std::sync::Arc;
use tonic::{Code, Request, Response, Result, Status};

/// Handlers for the Library gRPC service
pub struct LibraryServiceHandlers {
    pub(crate) db_pool: Arc<Pool>,
    pub(crate) igdb_client: Arc<IGDBProvider>,
    pub(crate) steam_web_api_client: Arc<SteamWebApiProvider>,
    pub(crate) job_manager: Arc<JobManager>,
    pub(crate) config_manager: Arc<ServerConfigManager>,
}

impl LibraryServiceHandlers {
    /// Creates a new LibraryServiceHandlers with the provided dependencies
    pub fn new(
        db_pool: Arc<Pool>,
        igdb_client: Arc<IGDBProvider>,
        steam_web_api_client: Arc<SteamWebApiProvider>,
        job_manager: Arc<JobManager>,
        config_manager: Arc<ServerConfigManager>,
    ) -> Self {
        Self {
            db_pool,
            igdb_client,
            steam_web_api_client,
            job_manager,
            config_manager,
        }
    }
}

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequest>,
    ) -> Result<Response<UpdateLibraryResponse>, Status> {
        match crate::update_handlers::update_library(self, request).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }

    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        match crate::metadata_handlers::update_metadata(self, request.into_inner().overwrite())
            .await
        {
            Ok(res) => Ok(Response::new(res)),
            Err(why) => Err(Status::new(Code::Internal, why)),
        }
    }

    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        match crate::delete_handlers::delete_library(self, request.into_inner()).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }

    async fn delete_missing_entries(
        &self,
        request: Request<DeleteMissingEntriesRequest>,
    ) -> Result<Response<DeleteMissingEntriesResponse>, Status> {
        match crate::delete_handlers::delete_missing_entries(self, request.into_inner()).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }
}
