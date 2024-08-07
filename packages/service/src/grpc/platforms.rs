use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use retrom_codegen::retrom::{
    self, platform_service_server::PlatformService, DeletePlatformsRequest,
    DeletePlatformsResponse, GetPlatformsRequest, GetPlatformsResponse,
};
use retrom_db::{schema, Pool};
use std::sync::Arc;
use tonic::{Code, Request, Response, Status};

#[derive(Debug, Clone)]
pub struct PlatformServiceHandlers {
    pub db_pool: Arc<Pool>,
}

impl PlatformServiceHandlers {
    pub fn new(db_pool: Arc<Pool>) -> Self {
        Self { db_pool }
    }
}

#[tonic::async_trait]
impl PlatformService for PlatformServiceHandlers {
    async fn get_platforms(
        &self,
        request: Request<GetPlatformsRequest>,
    ) -> Result<Response<GetPlatformsResponse>, Status> {
        let request = request.into_inner();
        let ids = &request.ids;
        let with_metadata = request.with_metadata();

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

        let platforms: Vec<retrom::Platform> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let metadata = match with_metadata {
            true => {
                let mut query = schema::platform_metadata::table
                    .into_boxed()
                    .select(retrom::PlatformMetadata::as_select());

                if !ids.is_empty() {
                    query = query.filter(schema::platform_metadata::platform_id.eq_any(ids));
                }

                let metadata: Vec<retrom::PlatformMetadata> = match query.load(&mut conn).await {
                    Ok(rows) => rows,
                    Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
                };

                metadata
            }
            false => vec![],
        };

        let response = GetPlatformsResponse {
            platforms,
            metadata,
        };

        Ok(Response::new(response))
    }

    async fn delete_platforms(
        &self,
        request: Request<DeletePlatformsRequest>,
    ) -> Result<Response<DeletePlatformsResponse>, Status> {
        let request = request.into_inner();

        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        diesel::delete(schema::platforms::table.filter(schema::platforms::id.eq_any(&request.ids)))
            .execute(&mut conn)
            .await
            .map_err(|why| Status::new(Code::Internal, why.to_string()))?;

        let response = DeletePlatformsResponse {};

        Ok(Response::new(response))
    }
}
