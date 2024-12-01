use std::{sync::Arc, time::Duration};

use emulators::EmulatorServiceHandlers;
use games::GameServiceHandlers;
use http::HeaderName;
use jobs::{job_manager::JobManager, JobServiceHandlers};
use library::LibraryServiceHandlers;
use metadata::MetadataServiceHandlers;
use platforms::PlatformServiceHandlers;
use retrom_codegen::retrom::{
    client_service_server::ClientServiceServer, emulator_service_server::EmulatorServiceServer,
    game_service_server::GameServiceServer, job_service_server::JobServiceServer,
    library_service_server::LibraryServiceServer, metadata_service_server::MetadataServiceServer,
    platform_service_server::PlatformServiceServer, server_service_server::ServerServiceServer,
    FILE_DESCRIPTOR_SET,
};
use retrom_db::Pool;
use tonic::transport::{server::Routes, Server};
use tower_http::cors::{AllowOrigin, Cors, CorsLayer};

use crate::{
    config::ServerConfig,
    providers::{igdb::provider::IGDBProvider, steam::provider::SteamWebApiProvider},
};

pub mod clients;
pub mod emulators;
pub mod games;
pub mod jobs;
pub mod library;
pub mod metadata;
pub mod platforms;
pub mod server;

const DEFAULT_MAX_AGE: Duration = Duration::from_secs(24 * 60 * 60);
const DEFAULT_EXPOSED_HEADERS: [HeaderName; 3] = [
    HeaderName::from_static("grpc-status"),
    HeaderName::from_static("grpc-message"),
    HeaderName::from_static("grpc-status-details-bin"),
];
const DEFAULT_ALLOW_HEADERS: [HeaderName; 5] = [
    HeaderName::from_static("x-grpc-web"),
    http::header::CONTENT_TYPE,
    HeaderName::from_static("x-user-agent"),
    HeaderName::from_static("grpc-timeout"),
    HeaderName::from_static("x-client-id"),
];

pub fn grpc_service(db_pool: Arc<Pool>, config: Arc<ServerConfig>) -> Cors<Routes> {
    let igdb_client = Arc::new(IGDBProvider::new(config.igdb.clone()));
    let steam_web_api_client = Arc::new(
        config
            .steam
            .as_ref()
            .map(|steam| SteamWebApiProvider::new(steam.clone())),
    );

    let job_manager = Arc::new(JobManager::new());

    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build()
        .unwrap();

    let library_service = LibraryServiceServer::new(LibraryServiceHandlers::new(
        db_pool.clone(),
        igdb_client.clone(),
        steam_web_api_client.clone(),
        job_manager.clone(),
        config.clone(),
    ));

    let metadata_service = MetadataServiceServer::new(MetadataServiceHandlers::new(
        db_pool.clone(),
        igdb_client.clone(),
    ));

    let game_service = GameServiceServer::new(GameServiceHandlers::new(db_pool.clone()));
    let platform_service =
        PlatformServiceServer::new(PlatformServiceHandlers::new(db_pool.clone()));

    let client_service =
        ClientServiceServer::new(clients::ClientServiceHandlers::new(db_pool.clone()));

    let server_service = ServerServiceServer::new(server::ServerServiceHandlers::new());

    let emulator_service =
        EmulatorServiceServer::new(EmulatorServiceHandlers::new(db_pool.clone()));

    let job_service = JobServiceServer::new(JobServiceHandlers::new(job_manager.clone()));

    Server::builder()
        .trace_fn(|_| tracing::info_span!("service"))
        .accept_http1(true)
        .layer(
            CorsLayer::new()
                .allow_origin(AllowOrigin::mirror_request())
                .allow_credentials(true)
                .expose_headers(DEFAULT_EXPOSED_HEADERS.to_vec())
                .allow_headers(DEFAULT_ALLOW_HEADERS.to_vec())
                .max_age(DEFAULT_MAX_AGE),
        )
        .add_service(reflection_service)
        .add_service(tonic_web::enable(library_service))
        .add_service(tonic_web::enable(game_service))
        .add_service(tonic_web::enable(platform_service))
        .add_service(tonic_web::enable(metadata_service))
        .add_service(tonic_web::enable(client_service))
        .add_service(tonic_web::enable(server_service))
        .add_service(tonic_web::enable(emulator_service))
        .add_service(tonic_web::enable(job_service))
        .into_service()
}
