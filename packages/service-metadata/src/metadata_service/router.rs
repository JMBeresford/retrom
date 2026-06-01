use crate::metadata_service::MetadataServiceHandlers;
use retrom_codegen::retrom::services::metadata::v1::metadata_service_server::MetadataServiceServer;
use retrom_db::DbPool;
use retrom_service_common::media_cache::MediaCache;
use retrom_service_config::config::ServerConfigManager;
use retrom_service_jobs::job_manager::JobManager;
use std::sync::Arc;

pub fn metadata_router(db_pool: DbPool) -> axum::Router {
    let config_manager =
        Arc::new(ServerConfigManager::new().expect("Could not create config manager"));

    let media_cache = Arc::new(MediaCache::new(config_manager.clone()));
    let job_manager = Arc::new(JobManager::new());

    let svc = MetadataServiceServer::new(MetadataServiceHandlers::new(
        db_pool,
        media_cache,
        job_manager,
        config_manager,
    ));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
