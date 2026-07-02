use crate::{
    igdb_service::router::igdb_router, metadata_service::router::metadata_router as core_router,
    provider_service::router::provider_router, steam_service::router::steam_router,
};
use retrom_codegen::retrom::services::config::v1::config_service_client::ConfigServiceClient;
use retrom_db::DbPool;
use tonic::transport::Channel;

/// Build an [`axum::Router`] that serves the metadata gRPC endpoints.
pub fn metadata_router(
    db_pool: DbPool,
    config_svc_client: ConfigServiceClient<Channel>,
) -> axum::Router {
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
