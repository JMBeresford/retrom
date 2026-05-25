use retrom_codegen::retrom::services::file_explorer::v1::file_explorer_service_server::FileExplorerServiceServer;

use crate::FileExplorerServiceHandlers;

/// Build an [`axum::Router`] that serves the [`FileExplorerService`] gRPC endpoints.
pub fn files_router() -> axum::Router {
    let file_explorer_service = FileExplorerServiceServer::new(FileExplorerServiceHandlers::new());

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(file_explorer_service);

    routes_builder.routes().into_axum_router()
}
