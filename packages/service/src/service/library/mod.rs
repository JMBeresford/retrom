use crate::providers::igdb::provider::IGDBProvider;
use db::Pool;
use generated::retrom::{
    library_service_server::LibraryService, UpdateLibraryMetadataRequest,
    UpdateLibraryMetadataResponse, UpdateLibraryRequest, UpdateLibraryResponse,
};
use library_manager::library::game_library::GameLibrary;
use std::{env, path::Path, sync::Arc};
use tonic::{Code, Request, Response, Result, Status};
use tracing::instrument;

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

#[tonic::async_trait]
impl LibraryService for LibraryServiceHandlers {
    async fn update_library(
        &self,
        request: Request<UpdateLibraryRequest>,
    ) -> Result<Response<UpdateLibraryResponse>, Status> {
        let content_dir = env::var("CONTENT_DIR").unwrap_or("./mock_content".to_string());

        let content_dir_path = Path::new(&content_dir);
        let library = match GameLibrary::from_content_dir(content_dir_path).await {
            Ok(library) => library,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let overwrite = request.into_inner().overwrite();

        let response_res = match overwrite {
            true => update_handlers::force_update_library(&mut conn, library).await,
            false => update_handlers::update_library(&mut conn, library).await,
        };

        match response_res {
            Ok(response) => Ok(Response::new(response)),
            Err(why) => Err(Status::new(Code::Internal, why.to_string())),
        }
    }

    #[instrument(skip_all)]
    async fn update_library_metadata(
        &self,
        request: Request<UpdateLibraryMetadataRequest>,
    ) -> Result<Response<UpdateLibraryMetadataResponse>, Status> {
        let response =
            match metadata_handlers::update_metadata(&self, request.into_inner().overwrite()).await
            {
                Ok(response) => response,
                Err(why) => return Err(Status::new(Code::Internal, why)),
            };

        Ok(Response::new(response))
    }
}
