use retrom_codegen::retrom::services::emulators::v1::emulator_service_server::EmulatorServiceServer;
use retrom_db::DbPool;

use crate::EmulatorServiceHandlers;

/// Build an [`axum::Router`] that serves the emulator gRPC endpoints.
pub fn emulators_router(db_pool: DbPool) -> axum::Router {
    let handlers = EmulatorServiceHandlers::new(db_pool);
    let emulator_service = EmulatorServiceServer::new(handlers);

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(emulator_service);

    routes_builder.routes().into_axum_router()
}
