use retrom_codegen::retrom::services::tags::v1::tags_service_server::TagsServiceServer;
use retrom_db::DbPool;

use crate::TagServiceHandlers;

/// Build an [`axum::Router`] that serves the [`TagsService`] gRPC endpoints.
pub fn tags_router(db_pool: DbPool) -> axum::Router {
    let tag_service = TagsServiceServer::new(TagServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(tag_service);

    routes_builder.routes().into_axum_router()
}
