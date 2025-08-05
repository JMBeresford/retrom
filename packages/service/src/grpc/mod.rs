use std::{sync::Arc, time::Duration};

use diesel_async::pooled_connection::AsyncDieselConnectionManager;
use emulators::EmulatorServiceHandlers;
use file_explorer::FileExplorerServiceHandlers;
use games::GameServiceHandlers;
use http::HeaderName;
use jobs::{job_manager::JobManager, JobServiceHandlers};
use library::LibraryServiceHandlers;
use metadata::MetadataServiceHandlers;
use platforms::PlatformServiceHandlers;
use retrom_codegen::retrom::{
    client_service_server::ClientServiceServer, emulator_service_server::EmulatorServiceServer,
    file_explorer_service_server::FileExplorerServiceServer,
    game_service_server::GameServiceServer, job_service_server::JobServiceServer,
    library_service_server::LibraryServiceServer, metadata_service_server::MetadataServiceServer,
    platform_service_server::PlatformServiceServer, saves_service_server::SavesServiceServer,
    server_service_server::ServerServiceServer, FILE_DESCRIPTOR_SET,
};
use saves::SavesServiceHandlers;
use tonic::transport::{server::Routes, Server};
use tower_http::cors::{AllowOrigin, Cors, CorsLayer};

use crate::{
    config::ServerConfigManager,
    media_cache::MediaCache,
    meta::RetromDirs,
    providers::{igdb::provider::IGDBProvider, steam::provider::SteamWebApiProvider},
};

pub mod clients;
pub mod emulators;
pub mod file_explorer;
pub mod games;
pub mod jobs;
pub mod library;
pub mod metadata;
pub mod platforms;
mod saves;
pub mod server;

const DEFAULT_MAX_AGE: Duration = Duration::from_secs(24 * 60 * 60);
const DEFAULT_EXPOSED_HEADERS: [HeaderName; 3] = [
    HeaderName::from_static("grpc-status"),
    HeaderName::from_static("grpc-message"),
    HeaderName::from_static("grpc-status-details-bin"),
];

const DEFAULT_ALLOW_HEADERS: [HeaderName; 7] = [
    HeaderName::from_static("x-grpc-web"),
    http::header::CONTENT_TYPE,
    HeaderName::from_static("x-user-agent"),
    HeaderName::from_static("grpc-timeout"),
    HeaderName::from_static("x-client-id"),
    HeaderName::from_static("traceparent"),
    HeaderName::from_static("tracestate"),
];

pub fn grpc_service(db_url: &str, config_manager: Arc<ServerConfigManager>) -> Cors<Routes> {
    use std::num::NonZeroUsize;
    let shared_pool_config =
        AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(db_url);

    let library_pool_config =
        AsyncDieselConnectionManager::<diesel_async::AsyncPgConnection>::new(db_url);

    let num_cpus: usize = std::thread::available_parallelism()
        .unwrap_or(NonZeroUsize::new(2_usize).unwrap())
        .into();

    // shared pool used for service endpoints w/ light usage
    let shared_pool = Arc::new(
        deadpool::managed::Pool::builder(shared_pool_config)
            .max_size(num_cpus * 3)
            .build()
            .expect("Could not create pool"),
    );

    // The library service triggers jobs w/ many DB ops -- so we give it its own pool
    // so as to not starve the other services
    let library_pool = Arc::new(
        deadpool::managed::Pool::builder(library_pool_config)
            .max_size(num_cpus)
            .build()
            .expect("Could not create pool"),
    );

    let igdb_client = Arc::new(IGDBProvider::new(config_manager.clone()));
    let steam_web_api_client = Arc::new(SteamWebApiProvider::new(config_manager.clone()));

    let retrom_dirs = RetromDirs::new();
    let media_cache = Arc::new(MediaCache::new());

    let job_manager = Arc::new(JobManager::new());

    let reflection_service = tonic_reflection::server::Builder::configure()
        .register_encoded_file_descriptor_set(FILE_DESCRIPTOR_SET)
        .build()
        .unwrap();

    let library_service = LibraryServiceServer::new(LibraryServiceHandlers::new(
        library_pool.clone(),
        igdb_client.clone(),
        steam_web_api_client.clone(),
        job_manager.clone(),
        config_manager.clone(),
    ));

    let metadata_service = MetadataServiceServer::new(MetadataServiceHandlers::new(
        shared_pool.clone(),
        igdb_client.clone(),
        steam_web_api_client.clone(),
        media_cache.clone(),
    ));

    let game_service = GameServiceServer::new(GameServiceHandlers::new(shared_pool.clone()));
    let platform_service =
        PlatformServiceServer::new(PlatformServiceHandlers::new(shared_pool.clone()));

    let client_service =
        ClientServiceServer::new(clients::ClientServiceHandlers::new(shared_pool.clone()));

    let server_service = ServerServiceServer::new(server::ServerServiceHandlers {
        config: config_manager.clone(),
    });

    let emulator_service =
        EmulatorServiceServer::new(EmulatorServiceHandlers::new(shared_pool.clone()));

    let job_service = JobServiceServer::new(JobServiceHandlers::new(job_manager.clone()));
    let file_explorer_service = FileExplorerServiceServer::new(FileExplorerServiceHandlers::new());

    let saves_service = SavesServiceServer::new(SavesServiceHandlers::new(
        shared_pool.clone(),
        config_manager.clone(),
    ));

    Server::builder()
        // .accept_http1(true)
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
        .add_service(tonic_web::enable(file_explorer_service))
        .add_service(tonic_web::enable(saves_service))
        .into_service()
}
