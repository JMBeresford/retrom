use crate::LibraryServiceHandlers;
use retrom_codegen::retrom::services::library::v1::library_service_server::LibraryServiceServer;
use retrom_db::DbPool;
use retrom_service_jobs::job_manager::JobManager;
use std::sync::Arc;

/// Build an [`axum::Router`] that serves the library gRPC endpoints.
pub fn library_router(db_pool: DbPool) -> axum::Router {
    let job_manager = Arc::new(JobManager::new());
    let lib_handlers = LibraryServiceHandlers::new(db_pool, job_manager);
    let library_service = LibraryServiceServer::new(lib_handlers);

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(library_service);

    routes_builder.routes().into_axum_router()
}
