use db::{
    models::{platform::PlatformRow, IntoMessages},
    schema, Pool,
};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use generated::retrom::{
    platform_service_server::PlatformService, GetPlatformsRequest, GetPlatformsResponse,
};
use std::sync::Arc;
use tonic::{Code, Request, Response, Status};
use uuid::Uuid;

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
        let ids = request.into_inner().ids;
        let mut conn = match self.db_pool.get().await {
            Ok(conn) => conn,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let mut query = schema::platforms::table
            .into_boxed()
            .select(PlatformRow::as_select());

        if !ids.is_empty() {
            let ids = ids
                .iter()
                .filter_map(|id| match Uuid::parse_str(id) {
                    Ok(id) => Some(id),
                    Err(why) => {
                        tracing::error!("Could not parse UUID: {}", why);
                        None
                    }
                })
                .collect::<Vec<Uuid>>();

            query = query.filter(schema::platforms::id.eq_any(ids));
        }

        let rows: Vec<PlatformRow> = match query.load(&mut conn).await {
            Ok(rows) => rows,
            Err(why) => return Err(Status::new(Code::Internal, why.to_string())),
        };

        let response = GetPlatformsResponse {
            platforms: PlatformRow::into_messages(rows),
        };

        Ok(Response::new(response))
    }
}
