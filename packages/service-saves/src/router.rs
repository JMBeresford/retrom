use crate::{v1::service::SavesServiceHandlers, v2::service::EmulatorSavesServiceHandlers};
use retrom_codegen::retrom::services::saves::{
    v1::saves_service_server::SavesServiceServer,
    v2::emulator_saves_service_server::EmulatorSavesServiceServer,
};
use retrom_db::DbPool;
use retrom_service_common::grpc_clients::{
    config_svc::get_config_svc_client, library_svc::get_library_svc_client,
};

/// Build an [`axum::Router`] that serves the saves gRPC endpoints.
pub fn saves_router(db_pool: DbPool) -> axum::Router {
    let config_svc_client = get_config_svc_client(None);
    let library_svc_client = get_library_svc_client(None);

    let saves_service_v1 = SavesServiceServer::new(SavesServiceHandlers::new(
        db_pool.clone(),
        config_svc_client,
        library_svc_client,
    ));

    let emulator_saves_service_v2 =
        EmulatorSavesServiceServer::new(EmulatorSavesServiceHandlers::new());

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder
        .add_service(saves_service_v1)
        .add_service(emulator_saves_service_v2);

    routes_builder.routes().into_axum_router().reset_fallback()
}
