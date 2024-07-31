use crate::providers::igdb::provider::IGDBProvider;
use futures::Stream;
use retrom_codegen::retrom::{
    library_service_server::LibraryService, DeleteLibraryRequest, DeleteLibraryResponse,
    UpdateLibraryMetadataRequest, UpdateLibraryMetadataResponse, UpdateLibraryRequest,
    UpdateLibraryResponse,
};
use retrom_db::Pool;
use std::{pin::Pin, sync::Arc};
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Code, Request, Response, Result, Status};
use tracing::instrument;

mod delete_handlers;
mod metadata_handlers;
mod update_handlers;
pub struct LibraryServiceHandlers {
    db_pool: Arc<Pool>,
    igdb_client: Arc<IGDBProvider>,
}

impl LibraryServiceHandlers {
    pub fn new(db_pool: Arc<Pool>, igdb_client: Arc<IGDBProvider>) -> Self {
        Self {
            db_pool,
            igdb_client,
        }
    }
}

pub type MetadataResponseStream =
    Pin<Box<dyn Stream<Item = Result<UpdateLibraryMetadataResponse, Status>> + Send>>;

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    type UpdateLibraryMetadataStream = MetadataResponseStream;

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
    ) -> Result<Response<Self::UpdateLibraryMetadataStream>, Status> {
        let (tx, mut rx) =
            tokio::sync::mpsc::channel::<Result<UpdateLibraryMetadataResponse, Status>>(32);
        let output_stream = ReceiverStream::new(rx);

        match metadata_handlers::update_metadata(&self, request.into_inner().overwrite(), tx).await
        {
            Ok(_) => Ok(Response::new(
                Box::pin(output_stream) as MetadataResponseStream
            )),
            Err(why) => Err(Status::new(Code::Internal, why)),
        }
    }

    #[instrument(skip_all)]
    async fn delete_library(
        &self,
        request: Request<DeleteLibraryRequest>,
    ) -> Result<Response<DeleteLibraryResponse>, Status> {
        match delete_handlers::delete_library(&self, request.into_inner()).await {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(why),
        }
    }
}
