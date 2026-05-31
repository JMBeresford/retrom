use super::MetadataServiceHandlers;
use retrom_codegen::retrom::services::{
    config::v1::MetadataConfig,
    metadata::v1::{
        metadata_service_server::MetadataService, PlatformMetadata, UpdatePlatformMetadataRequest,
    },
};
use retrom_db::{run_migrations, DbPool};
use retrom_service_common::media_cache::MediaCache;
use retrom_service_config::config::ServerConfigManager;
use retrom_service_jobs::job_manager::JobManager;
use sqlx::sqlite::SqlitePoolOptions;
use std::{sync::Arc, sync::OnceLock};
use tokio::sync::Mutex;
use tonic::Request;

fn config_lock() -> &'static Mutex<()> {
    static CONFIG_LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    CONFIG_LOCK.get_or_init(|| Mutex::new(()))
}

async fn test_service(store_metadata_locally: bool) -> (MetadataServiceHandlers, Arc<JobManager>, DbPool) {
    let url = "sqlite::memory:";
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect(url)
        .await
        .expect("could not open sqlite pool");

    run_migrations(&pool, url)
        .await
        .expect("could not run migrations");
    sqlx::query("alter table platform_metadata add column igdb_id integer")
        .execute(&pool)
        .await
        .expect("could not add igdb_id column for test schema");

    let config_manager = Arc::new(ServerConfigManager::new().expect("could not create config manager"));
    let mut config = config_manager.get_config().await;
    config
        .metadata
        .get_or_insert(MetadataConfig::default())
        .store_metadata_locally = store_metadata_locally;
    config_manager
        .update_config(config)
        .await
        .expect("could not update config");

    let job_manager = Arc::new(JobManager::new());
    let service = MetadataServiceHandlers::new(
        pool.clone(),
        Arc::new(MediaCache::new(config_manager.clone())),
        job_manager.clone(),
        config_manager,
    );

    (service, job_manager, pool)
}

async fn seed_platform_and_provider(pool: &DbPool, platform_id: &str, provider_id: &str) {
    sqlx::query("insert into platforms (id) values (?)")
        .bind(platform_id)
        .execute(pool)
        .await
        .expect("could not insert test platform");

    sqlx::query("insert into metadata_providers (id, name) values (?, ?)")
        .bind(provider_id)
        .bind("Test Provider")
        .execute(pool)
        .await
        .expect("could not insert test provider");
}

#[tokio::test]
async fn update_platform_metadata_skips_cache_jobs_when_disabled() {
    let _config_guard = config_lock().lock().await;
    let (service, job_manager, pool) = test_service(false).await;
    let platform_id = "00000000-0000-0000-4000-000000000001";
    let provider_id = "test-provider";
    seed_platform_and_provider(&pool, platform_id, provider_id).await;

    service
        .update_platform_metadata(Request::new(UpdatePlatformMetadataRequest {
            metadata: vec![PlatformMetadata {
                id: String::new(),
                platform_id: platform_id.to_string(),
                provider_id: provider_id.to_string(),
                name: Some("Platform".to_string()),
                description: None,
                background_url: Some("https://example.com/background.jpg".to_string()),
                icon_url: None,
                logo_url: None,
                igdb_id: None,
                created_at: None,
                updated_at: None,
            }],
        }))
        .await
        .expect("update_platform_metadata should succeed");

    assert!(job_manager.list_jobs(None).await.is_empty());
}

#[tokio::test]
async fn update_platform_metadata_enqueues_cache_jobs_when_enabled() {
    let _config_guard = config_lock().lock().await;
    let (service, job_manager, pool) = test_service(true).await;
    let platform_id = "00000000-0000-0000-4000-000000000002";
    let provider_id = "test-provider-2";
    seed_platform_and_provider(&pool, platform_id, provider_id).await;

    service
        .update_platform_metadata(Request::new(UpdatePlatformMetadataRequest {
            metadata: vec![PlatformMetadata {
                id: String::new(),
                platform_id: platform_id.to_string(),
                provider_id: provider_id.to_string(),
                name: Some("Platform".to_string()),
                description: None,
                background_url: Some("https://example.com/background.jpg".to_string()),
                icon_url: None,
                logo_url: None,
                igdb_id: None,
                created_at: None,
                updated_at: None,
            }],
        }))
        .await
        .expect("update_platform_metadata should succeed");

    assert_eq!(job_manager.list_jobs(None).await.len(), 1);
}
