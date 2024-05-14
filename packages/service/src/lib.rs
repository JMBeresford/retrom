use db::get_db_url;
use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use generated::retrom::{
    game_service_server::GameServiceServer, library_service_server::LibraryServiceServer,
    metadata_service_server::MetadataServiceServer, platform_service_server::PlatformServiceServer,
    FILE_DESCRIPTOR_SET,
};
use service::{
    games::GameServiceHandlers, library::LibraryServiceHandlers, platforms::PlatformServiceHandlers,
};
use std::{net::SocketAddr, sync::Arc};
use tonic::transport::Server;
use tracing::info;
use tracing_subscriber::{fmt::format::FmtSpan, layer::SubscriberExt, util::SubscriberInitExt};

use crate::{providers::igdb::provider::IGDBProvider, service::metadata::MetadataServiceHandlers};

mod providers;
mod service;
mod utils;

pub async fn start_service() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,".into())
                .add_directive("tokio_postgres=info".parse().unwrap()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let addr: SocketAddr = "0.0.0.0:5001".parse().unwrap();

    let db_url = get_db_url();

    let config = AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(db_url);
    let pool = bb8::Pool::builder()
        .max_size(15)
        .build(config)
        .await
        .expect("Could not create pool");

    let pool_state = Arc::new(pool);
    let igdb_client = Arc::new(IGDBProvider::new());

    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build()
        .unwrap();

    let library_service = LibraryServiceServer::new(LibraryServiceHandlers::new(
        pool_state.clone(),
        igdb_client.clone(),
    ));
    let metadata_service = MetadataServiceServer::new(MetadataServiceHandlers::new(
        pool_state.clone(),
        igdb_client.clone(),
    ));
    let game_service = GameServiceServer::new(GameServiceHandlers::new(pool_state.clone()));
    let platform_service =
        PlatformServiceServer::new(PlatformServiceHandlers::new(pool_state.clone()));

    info!("Starting server at: {}", addr.to_string());

    Server::builder()
        .accept_http1(true)
        .trace_fn(|_| tracing::info_span!("service"))
        .add_service(reflection_service)
        .add_service(tonic_web::enable(library_service))
        .add_service(tonic_web::enable(game_service))
        .add_service(tonic_web::enable(platform_service))
        .add_service(metadata_service)
        .serve(addr)
        .await
        .expect("Could not start server");
}
