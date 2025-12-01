//! Retrom Library Service
//!
//! This crate provides the library management service for the Retrom video game library.
//! It handles library scanning, content resolution, and metadata management.
//!
//! # Usage
//!
//! ```rust,ignore
//! use retrom_library_service::library_service_server;
//!
//! let library_service = library_service_server(
//!     db_pool,
//!     igdb_client,
//!     steam_web_api_client,
//!     job_manager,
//!     config_manager,
//! );
//! ```

use retrom_codegen::retrom::library_service_server::LibraryServiceServer;
use retrom_db::Pool;
use retrom_service_common::{
    config::ServerConfigManager,
    metadata_providers::{igdb::provider::IGDBProvider, steam::provider::SteamWebApiProvider},
};
use std::sync::Arc;

pub mod content_resolver;
mod delete_handlers;
mod handlers;
mod job_manager;
mod metadata_handlers;
mod update_handlers;

pub use handlers::LibraryServiceHandlers;
pub use job_manager::{JobError, JobManager, JobOptions};

/// Creates a configured `LibraryServiceServer` with the provided dependencies.
///
/// # Arguments
///
/// * `db_pool` - Database connection pool for library operations
/// * `igdb_client` - IGDB metadata provider client
/// * `steam_web_api_client` - Steam Web API metadata provider client
/// * `job_manager` - Background job manager for async operations
/// * `config_manager` - Server configuration manager
///
/// # Returns
///
/// A configured `LibraryServiceServer` ready to be added to a gRPC router
pub fn library_service_server(
    db_pool: Arc<Pool>,
    igdb_client: Arc<IGDBProvider>,
    steam_web_api_client: Arc<SteamWebApiProvider>,
    job_manager: Arc<JobManager>,
    config_manager: Arc<ServerConfigManager>,
) -> LibraryServiceServer<LibraryServiceHandlers> {
    LibraryServiceServer::new(LibraryServiceHandlers::new(
        db_pool,
        igdb_client,
        steam_web_api_client,
        job_manager,
        config_manager,
    ))
}
