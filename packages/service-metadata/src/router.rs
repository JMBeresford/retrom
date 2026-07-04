use crate::{
    igdb_service::router::igdb_router, metadata_service::router::metadata_router as core_router,
    provider_service::router::provider_router, steam_service::router::steam_router,
};
use retrom_db::DbPool;
use retrom_service_common::grpc_clients::config_svc::get_config_svc_client;

/// Build an [`axum::Router`] that serves the metadata gRPC endpoints.
pub fn metadata_router(db_pool: DbPool) -> axum::Router {
    let config_svc_client = get_config_svc_client(None);
    let steam_router = steam_router(db_pool.clone(), config_svc_client.clone());
    let igdb_router = igdb_router(db_pool.clone(), config_svc_client.clone());
    let provider_router = provider_router(db_pool.clone());
    let core_router = core_router(db_pool, config_svc_client);

    core_router
        .merge(steam_router)
        .merge(igdb_router)
        .merge(provider_router)
        .reset_fallback()
}
