use crate::ClientServiceHandlers;
use retrom_codegen::retrom::services::clients::v1::client_service_server::ClientServiceServer;
use retrom_db::DbPool;

/// Build an [`axum::Router`] that serves the [`ClientService`] gRPC endpoints.
pub fn clients_router(db_pool: DbPool) -> axum::Router {
    let client_service = ClientServiceServer::new(ClientServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(client_service);

    routes_builder.routes().into_axum_router()
}
