use crate::steam_service::SteamServiceHandlers;
use retrom_codegen::retrom::services::metadata::v1::steam_service_server::SteamServiceServer;
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::steam::provider::SteamWebApiProvider;
use retrom_service_config::config::ServerConfigManager;
use std::sync::Arc;

pub fn steam_router(db_pool: DbPool) -> axum::Router {
    let config_manager =
        Arc::new(ServerConfigManager::new().expect("Could not create config manager"));

    let steam_provider = Arc::new(SteamWebApiProvider::new(config_manager.clone()));

    let svc = SteamServiceServer::new(SteamServiceHandlers {
        db_pool,
        steam_provider,
    });

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
