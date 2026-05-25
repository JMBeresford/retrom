use crate::provider_service::MetadataProviderServiceHandlers;
use retrom_codegen::retrom::services::metadata::v1::metadata_provider_service_server::MetadataProviderService;
use retrom_db::DbPool;

pub fn provider_router(db_pool: DbPool) -> axum::Router {
    let svc = MetadataProviderService::new(MetadataProviderServiceHandlers { db_pool });

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
