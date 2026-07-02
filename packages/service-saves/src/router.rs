use crate::{v1::service::SavesServiceHandlers, v2::service::EmulatorSavesServiceHandlers};
use retrom_codegen::retrom::services::{
    config::v1::config_service_client::ConfigServiceClient,
    saves::{
        v1::saves_service_server::SavesServiceServer,
        v2::emulator_saves_service_server::EmulatorSavesServiceServer,
    },
};
use retrom_db::DbPool;
use tonic::transport::Channel;

/// Build an [`axum::Router`] that serves the saves gRPC endpoints.
pub fn saves_router(
    db_pool: DbPool,
    config_svc_client: ConfigServiceClient<Channel>,
) -> axum::Router {
    let saves_service_v1 = SavesServiceServer::new(SavesServiceHandlers::new(
        db_pool.clone(),
        config_svc_client,
    ));

    let emulator_saves_service_v2 =
        EmulatorSavesServiceServer::new(EmulatorSavesServiceHandlers::new(db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder
        .add_service(saves_service_v1)
        .add_service(emulator_saves_service_v2);

    routes_builder.routes().into_axum_router()
}
