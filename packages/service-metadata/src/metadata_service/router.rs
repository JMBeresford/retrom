use crate::metadata_service::MetadataServiceHandlers;
use retrom_codegen::retrom::services::{
    config::v1::config_service_client::ConfigServiceClient,
    metadata::v1::metadata_service_server::MetadataServiceServer,
};
use retrom_db::DbPool;
use retrom_service_common::media_cache::MediaCache;
use retrom_service_jobs::job_manager::JobManager;
use std::sync::Arc;
use tonic::transport::Channel;

pub fn metadata_router(
    db_pool: DbPool,
    config_svc_client: ConfigServiceClient<Channel>,
) -> axum::Router {
    let media_cache = Arc::new(MediaCache::new(config_svc_client.clone()));
    let job_manager = Arc::new(JobManager::new());

    let svc = MetadataServiceServer::new(MetadataServiceHandlers::new(
        db_pool,
        media_cache,
        job_manager,
        config_svc_client,
    ));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
