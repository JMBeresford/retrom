use std::sync::Arc;

use db::Pool;
use games::GameServiceHandlers;
use generated::retrom::{
    game_service_server::GameServiceServer, library_service_server::LibraryServiceServer,
    metadata_service_server::MetadataServiceServer, platform_service_server::PlatformServiceServer,
    FILE_DESCRIPTOR_SET,
};
use library::LibraryServiceHandlers;
use metadata::MetadataServiceHandlers;
use platforms::PlatformServiceHandlers;
use tonic::transport::{server::Routes, Server};

use crate::providers::igdb::provider::IGDBProvider;

pub mod games;
pub mod library;
pub mod metadata;
pub mod platforms;

pub fn grpc_service(db_pool: Arc<Pool>) -> Routes {
    let igdb_client = Arc::new(IGDBProvider::new());

    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build()
        .unwrap();

    let library_service = LibraryServiceServer::new(LibraryServiceHandlers::new(
        db_pool.clone(),
        igdb_client.clone(),
    ));

    let metadata_service = MetadataServiceServer::new(MetadataServiceHandlers::new(
        db_pool.clone(),
        igdb_client.clone(),
    ));

    let game_service = GameServiceServer::new(GameServiceHandlers::new(db_pool.clone()));
    let platform_service =
        PlatformServiceServer::new(PlatformServiceHandlers::new(db_pool.clone()));

    Server::builder()
        .trace_fn(|_| tracing::info_span!("service"))
        .accept_http1(true)
        .add_service(reflection_service)
        .add_service(tonic_web::enable(library_service))
        .add_service(tonic_web::enable(game_service))
        .add_service(tonic_web::enable(platform_service))
        .add_service(tonic_web::enable(metadata_service))
        .into_service()
}
