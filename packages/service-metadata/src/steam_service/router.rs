use crate::steam_service::SteamServiceHandlers;
use retrom_codegen::retrom::services::{
    config::v1::config_service_client::ConfigServiceClient,
    metadata::v1::steam_service_server::SteamServiceServer,
};
use retrom_db::DbPool;
use retrom_service_common::metadata_providers::steam::provider::SteamWebApiProvider;
use std::sync::Arc;
use tonic::transport::Channel;

pub fn steam_router(
    db_pool: DbPool,
    config_svc_client: ConfigServiceClient<Channel>,
) -> axum::Router {
    let steam_provider = Arc::new(SteamWebApiProvider::new(config_svc_client));

    let svc = SteamServiceServer::new(SteamServiceHandlers {
        db_pool,
        steam_provider,
    });

    let mut routes_builder = tonic::service::Routes::builder();
    routes_builder.add_service(svc);

    routes_builder.routes().into_axum_router().reset_fallback()
}
