use crate::igdb_service::IgdbServiceHandlers;
use retrom_codegen::retrom::services::{
    config::v1::config_service_client::ConfigServiceClient,
    metadata::v1::igdb_service_server::IgdbServiceServer,
};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::igdb::provider::IGDBProvider;
use std::sync::Arc;
use tonic::transport::Channel;

pub fn igdb_router(
    db_pool: DbPool,
    config_svc_client: ConfigServiceClient<Channel>,
) -> axum::Router {
    let igdb_client = Arc::new(IGDBProvider::new(config_svc_client));

    let svc = IgdbServiceServer::new(IgdbServiceHandlers::new(igdb_client, db_pool));

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
