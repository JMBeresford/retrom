use retrom_codegen::retrom::{
    platform_service_server::PlatformService, DeletePlatformsRequest, DeletePlatformsResponse,
    GetPlatformsRequest, GetPlatformsResponse, UpdatePlatformsRequest, UpdatePlatformsResponse,
};
use retrom_db::Pool;
use std::sync::Arc;
use tonic::{Request, Response, Status};

use crate::library::platform_handlers;

#[derive(Clone)]
pub struct PlatformServiceHandlers {
    pub db_pool: Arc<Pool>,
}

impl PlatformServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

/// Forwarding stub — all RPCs delegate to `retrom.services.library.v1.LibraryService`
/// equivalents in [`crate::library::platform_handlers`].
#[tonic::async_trait]
impl PlatformService for PlatformServiceHandlers {
    async fn get_platforms(
        &self,
        request: Request<GetPlatformsRequest>,
    ) -> Result<Response<GetPlatformsResponse>, Status> {
        platform_handlers::get_platforms(self.db_pool.clone(), request.into_inner())
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

    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        platform_handlers::delete_platforms(self.db_pool.clone(), request.into_inner())
            .await
            .map(Response::new)
    }
}
