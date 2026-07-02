use crate::{config_manager::ServerConfigManager, ConfigServiceHandlers};
use retrom_codegen::retrom::services::config::v1::config_service_server::ConfigServiceServer;

/// Build an [`axum::Router`] that serves the [`ConfigService`] gRPC endpoints.
pub fn config_router(config_manager: Option<ServerConfigManager>) -> axum::Router {
    let manager = config_manager.unwrap_or_else(|| {
        ServerConfigManager::new().expect("Failed to create ServerConfigManager")
    });

    let config_service = ConfigServiceServer::new(ConfigServiceHandlers::new(manager));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(config_service);

    routes_builder.routes().into_axum_router()
}
