use crate::igdb_service::IgdbServiceHandlers;
use retrom_codegen::retrom::services::metadata::v1::igdb_service_server::IgdbServiceServer;
use retrom_db::DbPool;
use retrom_service_common::{
    grpc_clients::config_svc::CommonConfigServiceClient,
    metadata_providers::igdb::provider::IGDBProvider,
};
use std::sync::Arc;

pub fn igdb_router(db_pool: DbPool, config_svc_client: CommonConfigServiceClient) -> axum::Router {
    let igdb_client = Arc::new(IGDBProvider::new(config_svc_client));

    let svc = IgdbServiceServer::new(IgdbServiceHandlers::new(igdb_client, db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
