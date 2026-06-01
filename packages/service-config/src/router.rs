use retrom_codegen::retrom::services::config::v1::config_service_server::ConfigServiceServer;

use crate::ConfigServiceHandlers;

/// Build an [`axum::Router`] that serves the [`ConfigService`] gRPC endpoints.
pub fn config_router() -> axum::Router {
    let config_service = ConfigServiceServer::new(ConfigServiceHandlers::new());

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(config_service);

    routes_builder.routes().into_axum_router()
}
