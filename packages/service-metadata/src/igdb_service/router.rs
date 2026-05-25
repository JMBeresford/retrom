use crate::igdb_service::IgdbServiceHandlers;
use retrom_codegen::retrom::services::metadata::v1::igdb_service_server::IgdbServiceServer;
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::igdb::provider::IGDBProvider;
use retrom_service_config::config::ServerConfigManager;

pub fn igdb_router(db_pool: DbPool) -> axum::Router {
    let config_manager =
        Arc::new(ServerConfigManager::new().expect("Could not create config manager"));

    let igdb_client = Arc::new(IgdbProvider::new(config_manager));

    let svc = IgdbServiceServer::new(IgdbServiceHandlers {
        db_pool,
        igdb_client,
    });

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
