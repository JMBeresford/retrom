use retrom_codegen::retrom::services::saves::{
    v1::saves_service_server::SavesServiceServer,
    v2::emulator_saves_service_server::EmulatorSavesServiceServer,
};
use retrom_db::Pool;
use retrom_service_common::config::ServerConfigManager;
use std::sync::Arc;

pub mod v1;
pub mod v2;

pub use v1::service::SavesServiceHandlers;
pub use v2::service::EmulatorSavesServiceHandlers;

/// Build an [`axum::Router`] that serves the saves gRPC endpoints.
pub fn saves_router(db_pool: Arc<Pool>, config_manager: Arc<ServerConfigManager>) -> axum::Router {
    let saves_service_v1 =
        SavesServiceServer::new(SavesServiceHandlers::new(db_pool.clone(), config_manager));

    let emulator_saves_service_v2 =
        EmulatorSavesServiceServer::new(EmulatorSavesServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder
        .add_service(saves_service_v1)
        .add_service(emulator_saves_service_v2);

    routes_builder.routes().into_axum_router()
}
