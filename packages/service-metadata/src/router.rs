use crate::{
    igdb_service::router::igdb_router, metadata_service::router::metadata_router as core_router,
    provider_service::router::provider_router, steam_service::router::steam_router,
};
use retrom_db::DbPool;

/// Build an [`axum::Router`] that serves the metadata gRPC endpoints.
pub fn metadata_router(db_pool: DbPool) -> axum::Router {
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
