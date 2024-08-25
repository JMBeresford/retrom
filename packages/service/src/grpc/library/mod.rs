use super::jobs::job_manager::JobManager;
use crate::providers::igdb::provider::IGDBProvider;
use retrom_codegen::retrom::{
    library_service_server::LibraryService, DeleteLibraryRequest, DeleteLibraryResponse,
    UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse, UpdateLibraryRequest,
    UpdateLibraryResponse,
};
use retrom_db::Pool;
use std::sync::Arc;
use tonic::{Code, Request, Response, Result, Status};
use tracing::instrument;

mod delete_handlers;
mod metadata_handlers;
mod update_handlers;
pub struct LibraryServiceHandlers {
    db_pool: Arc<Pool>,
    igdb_client: Arc<IGDBProvider>,
    job_manager: Arc<JobManager>,
}

impl LibraryServiceHandlers {
    pub fn new(
        db_pool: Arc<Pool>,
        igdb_client: Arc<IGDBProvider>,
        job_manager: Arc<JobManager>,
    ) -> Self {
        Self {
            db_pool,
            igdb_client,
            job_manager,
        }
    }
}

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    #[tracing::instrument(skip_all)]
    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequest>,
    ) -> Result<Response<UpdateLibraryResponse>, Status> {
        match update_handlers::update_library(self, request).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }

    #[instrument(skip_all)]
    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        match metadata_handlers::update_metadata(self, request.into_inner().overwrite()).await {
            Ok(_) => Ok(Response::new(UpdateLibraryMetadataResponse {})),
            Err(why) => Err(Status::new(Code::Internal, why)),
        }
    }

    #[instrument(skip_all)]
    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        match delete_handlers::delete_library(self, request.into_inner()).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }
}
