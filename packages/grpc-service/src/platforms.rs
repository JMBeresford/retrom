use crate::library::platform_handlers;
use diesel::QueryDsl;
use retrom_codegen::retrom::{
    self, platform_service_server::PlatformService, DeletePlatformsRequest,
    DeletePlatformsResponse, GetPlatformsRequest, GetPlatformsResponse, UpdatePlatformsRequest,
    UpdatePlatformsResponse,
};
use retrom_db::{schema, Pool};
use retrom_service_common::config::ServerConfigManager;
use std::sync::Arc;
use tonic::{Code, Request, Response, Status};

const STEAM_PLATFORM_PATH: &str = "__RETROM_RESERVED__/Steam";

#[derive(Clone)]
pub struct PlatformServiceHandlers {
    pub db_pool: Arc<Pool>,
    pub config_manager: Arc<ServerConfigManager>,
}

impl PlatformServiceHandlers {
    pub fn new(db_pool: Arc<Pool>, config_manager: Arc<ServerConfigManager>) -> Self {
        Self {
            db_pool,
            config_manager,
        }
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
        let request = request.into_inner();
        let ids = &request.ids;
        let with_metadata = request.with_metadata();
        let with_deleted = request.include_deleted();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut query = schema::platforms::table
            .into_boxed()
            .select(retrom::Platform::as_select());

        if !ids.is_empty() {
            query = query.filter(schema::platforms::id.eq_any(ids));
        }

        if !with_deleted {
            query = query.filter(schema::platforms::is_deleted.eq(false));
        }

        let steam_configured = self
            .config_manager
            .get_config()
            .await
            .steam
            .is_some_and(|steam| {
                !steam.api_key.trim().is_empty() && !steam.user_id.trim().is_empty()
            });

        if !steam_configured {
            query = query.filter(schema::platforms::path.ne(STEAM_PLATFORM_PATH));
        }

        let platforms: Vec<retrom::Platform> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let metadata = match with_metadata {
            true => {
                let platform_ids: Vec<_> = platforms.iter().map(|platform| platform.id).collect();

                if platform_ids.is_empty() {
                    vec![]
                } else {
                    let query = schema::platform_metadata::table
                        .into_boxed()
                        .filter(schema::platform_metadata::platform_id.eq_any(platform_ids))
                        .select(retrom::PlatformMetadata::as_select());

                    match query.load(&mut conn).await {
                        Ok(rows) => rows,
                        Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
                    }
                }
            }
            false => vec![],
        };

        let response = GetPlatformsResponse {
            platforms,
            metadata,
        };

        Ok(Response::new(response))
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
