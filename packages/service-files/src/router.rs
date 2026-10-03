use crate::FileServiceHandlers;
use retrom_codegen::retrom::services::files::v1::file_service_server::FileServiceServer;
use retrom_db::DbPool;

/// Build an [`axum::Router`] that serves the [`FileService`] gRPC endpoints.
pub fn files_router(db_pool: DbPool) -> axum::Router {
    let file_explorer_service = FileServiceServer::new(FileServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(file_explorer_service);

    routes_builder.routes().into_axum_router().reset_fallback()
}
