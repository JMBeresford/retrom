use crate::{
    igdb_service::router::igdb_router, metadata_service::router::metadata_router as core_router,
    provider_service::router::provider_router, steam_service::router::steam_router,
};
use retrom_service_common::metadata_providers::steam::provider::SteamWebApiProvider;
use retrom_service_config::config::ServerConfigManager;
use std::sync::Arc;

/// Build an [`axum::Router`] that serves the metadata gRPC endpoints.
pub fn metadata_router(db_pool: Arc<Pool>) -> axum::Router {
    let config_manager = ServerConfigManager::new().expect("Could not create config manager");
    let media_cache = Arc::new(MediaCache::new(config_manager.clone()));
    let steam_router = steam_router(db_pool.clone());
    let igdb_router = igdb_router(db_pool.clone());
    let provider_router = provider_router(db_pool.clone());
    let core_router = core_router(db_pool);

    core_router
        .merge(steam_router)
        .merge(igdb_router)
        .merge(provider_router)
        .reset_fallback()
}
