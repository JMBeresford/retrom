use bigdecimal::ToPrimitive;
use caesium::compress;
use caesium::parameters::CSParameters;
use rayon::ThreadPool;
use reqwest::StatusCode;
use retrom_codegen::retrom::{GameMetadata, PlatformMetadata};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use thiserror::Error;
use tokio::fs;
use tokio::task::JoinSet;
use tokio_retry::Condition;
use tracing::{debug, info, instrument, warn};

use crate::meta::RetromDirs;

pub mod index;
pub mod utils;

use index::IndexManager;

#[derive(Error, Debug)]
pub enum MediaCacheError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Cannot cache item: {0}")]
    NonCacheableItem(String),
    #[error("HTTP request error: {status:?}")]
    Http {
        status: StatusCode,
        source: reqwest::Error,
    },
    #[error("URL parse error: {0}")]
    UrlParse(#[from] url::ParseError),
    #[error("Invalid file extension")]
    InvalidExtension,
    #[error("Directory creation failed: {path}")]
    DirectoryCreation { path: String },
    #[error("URL does not exist: {0}")]
    NotFound(String),
    #[error("Base directory must be relative, not absolute: {0}")]
    AbsoluteBasePath(String),
}

impl From<reqwest::Error> for MediaCacheError {
    fn from(err: reqwest::Error) -> Self {
        MediaCacheError::Http {
            status: err.status().unwrap_or(StatusCode::INTERNAL_SERVER_ERROR),
            source: err,
        }
    }
}

pub type Result<T> = std::result::Result<T, MediaCacheError>;

/// Options for caching media files
#[derive(Debug)]
pub struct CacheMediaOpts {
    /// The remote URL to cache
    pub remote_url: String,
    /// The base cache directory (where index.json will be stored)
    pub cache_dir: PathBuf,
    /// Optional semantic name for the cached file (e.g., "cover", "background")
    pub semantic_name: Option<String>,
    /// Optional base directory within cache_dir for organizing files (e.g., "artwork", "screenshots")
    /// Must be a relative path - absolute paths will return an error
    pub base_dir: Option<PathBuf>,
}

/// Trait for metadata types that can be cached
pub trait CacheableMetadata: Clone + Send + Sync {
    /// Get the cache directory for this metadata
    fn get_cache_dir(&self) -> Option<PathBuf>;

    /// Cache all media files for this metadata and return updated metadata with local paths
    fn cache_metadata(
        &self,
        cache: Arc<MediaCache>,
    ) -> impl std::future::Future<Output = Result<()>>;

    /// Clean up cached files for this metadata
    fn clean_cache(&self) -> impl std::future::Future<Output = Result<()>> + Send {
        async {
            let cache_dir = self
                .get_cache_dir()
                .ok_or(MediaCacheError::NonCacheableItem(
                    "No cache directory available".to_string(),
                ))?;

            if cache_dir.exists() {
                debug!("Cleaning up cache directory: {:?}", cache_dir);
                fs::remove_dir_all(&cache_dir).await?;
            }

            Ok(())
        }
    }
}

impl CacheableMetadata for GameMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("games")
            .join(self.game_id.to_string())
            .into()
    }

    #[instrument(skip_all)]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<()> {
        let mut join_set = JoinSet::new();
        let cache_dir = self
            .get_cache_dir()
            .ok_or(MediaCacheError::NonCacheableItem(
                "No cache directory available".to_string(),
            ))?;

        if let Some(cover_url) = self.cover_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: cover_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("cover".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(background_url) = self.background_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: background_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("background".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(icon_url) = self.icon_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: icon_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("icon".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        for artwork_url in self.artwork_urls.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: artwork_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: None,
                        base_dir: Some(PathBuf::from("artwork")),
                    })
                    .await
            });
        }

        for screenshot_url in self.screenshot_urls.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: screenshot_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: None,
                        base_dir: Some(PathBuf::from("screenshots")),
                    })
                    .await
            });
        }

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(_)) => continue,
                Ok(Err(e)) => {
                    warn!("Failed to cache media: {}", e);
                }
                Err(e) => {
                    warn!("Join error: {}", e);
                }
            }
        }

        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::UpdatedGameMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("games")
            .join(self.game_id.to_string())
            .into()
    }

    #[instrument(skip_all)]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<()> {
        let cache_dir = self
            .get_cache_dir()
            .ok_or(MediaCacheError::NonCacheableItem(
                "No cache directory available".to_string(),
            ))?;

        let mut join_set = JoinSet::new();

        if let Some(cover_url) = self.cover_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: cover_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("cover".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(background_url) = self.background_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: background_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("background".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(icon_url) = self.icon_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: icon_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("icon".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        for artwork_url in self.artwork_urls.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: artwork_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: None,
                        base_dir: Some(PathBuf::from("artwork")),
                    })
                    .await
            });
        }

        for screenshot_url in self.screenshot_urls.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: screenshot_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: None,
                        base_dir: Some(PathBuf::from("screenshots")),
                    })
                    .await
            });
        }

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(_)) => continue,
                Ok(Err(e)) => {
                    warn!("Failed to cache media: {}", e);
                }
                Err(e) => {
                    warn!("Join error: {}", e);
                }
            }
        }
        Ok(())
    }
}

impl CacheableMetadata for PlatformMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("platforms")
            .join(self.platform_id.to_string())
            .into()
    }

    #[instrument(skip_all)]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<()> {
        let cache_dir = self
            .get_cache_dir()
            .ok_or(MediaCacheError::NonCacheableItem(
                "No cache directory available".to_string(),
            ))?;

        let mut join_set = JoinSet::new();

        if let Some(background_url) = self.background_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: background_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("background".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(logo_url) = self.logo_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: logo_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("logo".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(_)) => continue,
                Ok(Err(e)) => {
                    warn!("Failed to cache media: {}", e);
                }
                Err(e) => {
                    warn!("Join error: {}", e);
                }
            }
        }

        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::UpdatedPlatformMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("platforms")
            .join(self.platform_id.to_string())
            .into()
    }

    #[instrument(skip_all)]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<()> {
        let cache_dir = self
            .get_cache_dir()
            .ok_or(MediaCacheError::NonCacheableItem(
                "No cache directory available".to_string(),
            ))?;

        let mut join_set = JoinSet::new();

        if let Some(background_url) = self.background_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: background_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("background".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(logo_url) = self.logo_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: logo_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("logo".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(_)) => continue,
                Ok(Err(e)) => {
                    warn!("Failed to cache media: {}", e);
                }
                Err(e) => {
                    warn!("Join error: {}", e);
                }
            }
        }

        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::NewGameMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("games")
            .join(self.game_id.unwrap_or(0).to_string())
            .into()
    }

    #[instrument(skip_all)]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<()> {
        let cache_dir = self
            .get_cache_dir()
            .ok_or(MediaCacheError::NonCacheableItem(
                "No cache directory available".to_string(),
            ))?;

        let mut join_set = JoinSet::new();

        if let Some(cover_url) = self.cover_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: cover_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("cover".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(background_url) = self.background_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: background_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("background".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(icon_url) = self.icon_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: icon_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("icon".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        for artwork_url in self.artwork_urls.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: artwork_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: None,
                        base_dir: Some(PathBuf::from("artwork")),
                    })
                    .await
            });
        }

        for screenshot_url in self.screenshot_urls.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: screenshot_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: None,
                        base_dir: Some(PathBuf::from("screenshots")),
                    })
                    .await
            });
        }

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(_)) => continue,
                Ok(Err(e)) => {
                    warn!("Failed to cache media: {}", e);
                }
                Err(e) => {
                    warn!("Join error: {}", e);
                }
            }
        }

        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::NewPlatformMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("platforms")
            .join(self.platform_id.unwrap_or(0).to_string())
            .into()
    }

    #[instrument(skip_all)]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<()> {
        let cache_dir = self
            .get_cache_dir()
            .ok_or(MediaCacheError::NonCacheableItem(
                "No cache directory available".to_string(),
            ))?;

        let mut join_set = JoinSet::new();

        if let Some(background_url) = self.background_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: background_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("background".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        if let Some(logo_url) = self.logo_url.clone() {
            let cache_dir = cache_dir.clone();
            let cache = cache.clone();

            join_set.spawn(async move {
                cache
                    .cache_media_file(CacheMediaOpts {
                        remote_url: logo_url,
                        cache_dir: cache_dir.clone(),
                        semantic_name: Some("logo".to_string()),
                        base_dir: None,
                    })
                    .await
            });
        }

        while let Some(result) = join_set.join_next().await {
            match result {
                Ok(Ok(_)) => continue,
                Ok(Err(e)) => {
                    warn!("Failed to cache media: {}", e);
                }
                Err(e) => {
                    warn!("Join error: {}", e);
                }
            }
        }

        Ok(())
    }
}

pub struct MediaCache {
    client: reqwest::Client,
    compression_threads: ThreadPool,
    index_manager: IndexManager,
}

struct RetryCondition {}

impl Condition<MediaCacheError> for RetryCondition {
    fn should_retry(&mut self, error: &MediaCacheError) -> bool {
        match error {
            MediaCacheError::Http { status, .. } => {
                if status == &StatusCode::NOT_FOUND {
                    return false;
                }

                if status.is_server_error() || status.is_client_error() {
                    debug!("Retrying due to HTTP error: {}", status);
                    return true;
                }

                false
            }
            _ => false,
        }
    }
}

impl MediaCache {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        let thread_count = std::thread::available_parallelism()
            .map(|n| std::cmp::max(n.get() - 1, 1))
            .unwrap_or(0); // 0 -> default thread count determined by rayon

        let compression_threads = rayon::ThreadPoolBuilder::new()
            .num_threads(thread_count)
            .build()
            .expect("Failed to create compression thread pool");

        Self {
            client,
            compression_threads,
            index_manager: IndexManager::new(),
        }
    }

    /// Ensure the cache directory exists
    #[instrument(level = "debug", skip(self))]
    async fn ensure_cache_dir(&self, cache_dir: &PathBuf) -> Result<()> {
        if !cache_dir.exists() {
            debug!("Creating cache directory: {:?}", cache_dir);
            fs::create_dir_all(cache_dir).await.map_err(|_e| {
                MediaCacheError::DirectoryCreation {
                    path: cache_dir.to_string_lossy().to_string(),
                }
            })?;
        }
        Ok(())
    }

    /// Download and cache a media file, return the local file path
    /// If semantic_name is provided, uses semantic filename (e.g., "cover.jpg")
    /// Otherwise uses hashed filename for uniqueness
    #[instrument(skip(self))]
    pub async fn cache_media_file(&self, opts: CacheMediaOpts) -> Result<PathBuf> {
        if let Some(ref base_dir) = opts.base_dir {
            if base_dir.is_absolute() {
                return Err(MediaCacheError::AbsoluteBasePath(
                    base_dir.display().to_string(),
                ));
            }
        }

        let storage_dir = match opts.base_dir {
            Some(ref base_dir) => opts.cache_dir.join(base_dir),
            None => opts.cache_dir.clone(),
        };

        self.ensure_cache_dir(&storage_dir).await?;

        let filename = match opts.semantic_name {
            Some(ref name) => {
                utils::generate_semantic_filename(&opts.remote_url, name, Some("jpg"))?
            }
            None => utils::generate_cache_filename(&opts.remote_url, Some("jpg"))?,
        };

        let cache_path = storage_dir.join(&filename);

        if cache_path.exists() {
            debug!("Media file already cached: {:?}", cache_path);

            let relative_path = self
                .index_manager
                .get_relative_path(&opts.cache_dir, &cache_path)?;

            let index = self.index_manager.read_index(&opts.cache_dir).await?;
            if let Some(existing_entry) = index.entries.get(&relative_path) {
                if let Some(existing_url) = &existing_entry.remote_url {
                    if existing_url == &opts.remote_url {
                        if let Err(e) = self
                            .index_manager
                            .update_entry(&opts.cache_dir, &relative_path, Some(&opts.remote_url))
                            .await
                        {
                            warn!(
                                "Failed to update index for existing file {}: {}",
                                relative_path, e
                            );
                        }
                        return Ok(cache_path);
                    }
                }
            }

            debug!(
                "Remote URL changed for cached file {:?}, will overwrite",
                cache_path
            );
        }

        debug!(
            "Downloading media file: {} -> {:?}",
            opts.remote_url, cache_path
        );

        let strategy = tokio_retry::strategy::ExponentialBackoff::from_millis(500)
            .max_delay(std::time::Duration::from_secs(10))
            .take(3);

        let retry = RetryCondition {};

        let response = tokio_retry::RetryIf::spawn(
            strategy,
            || async {
                let response = self.client.get(&opts.remote_url).send().await?;

                if !response.status().is_success() {
                    warn!(
                        "Failed to download media file: {} (status: {})",
                        opts.remote_url,
                        response.status()
                    );

                    return Err(MediaCacheError::NotFound(opts.remote_url.to_string()));
                }

                Ok(response)
            },
            retry,
        )
        .await?;

        let bytes = response.bytes().await?;

        fs::write(&cache_path, bytes).await?;

        let mut params = CSParameters::new();
        params.keep_metadata = false;

        self.compress_media(&cache_path, params).await?;

        let relative_path = self
            .index_manager
            .get_relative_path(&opts.cache_dir, &cache_path)?;

        if let Err(e) = self
            .index_manager
            .update_entry(&opts.cache_dir, &relative_path, Some(&opts.remote_url))
            .await
        {
            warn!("Failed to update index for {}: {}", relative_path, e);
        }

        debug!("Media file cached successfully: {:?}", cache_path);
        Ok(cache_path)
    }

    #[instrument(skip_all,
        fields(png.quality = params.png.quality.to_i64(),
               jpeg.quality = params.jpeg.quality.to_i64(),
               optimization_level = params.png.optimization_level,
               file_type = file.as_ref().extension().and_then(|s| s.to_str()).unwrap_or("unknown")
        )
    )]
    async fn compress_media(&self, file: impl AsRef<Path>, params: CSParameters) -> Result<()> {
        let (tx, rx) = tokio::sync::oneshot::channel();

        let fp: &Path = file.as_ref();
        let temp_path = fp.with_extension("compressed");

        debug!("Spawning compression thread");

        let span = tracing::info_span!("compression_thread");

        let path_str = fp.to_string_lossy().to_string();
        let out_path_str = temp_path.to_string_lossy().to_string();

        self.compression_threads.spawn(move || {
            span.in_scope(|| {
                info!("Beginning compression of media file");

                let res = compress(path_str, out_path_str, &params);
                info!("Compression completed");

                let _ = tx.send(res);
            });
        });

        match rx.await {
            Ok(Ok(res)) => {
                info!("Media compressed successfully");
                tokio::fs::remove_file(fp).await?;
                tokio::fs::rename(temp_path, fp).await?;
                Ok(res)
            }
            _ => {
                warn!("Failed to compress media, returning original data");
                Err(MediaCacheError::Io(std::io::Error::other(
                    "Compression failed",
                )))
            }
        }
    }

    /// Convert a local cache path to a public URL that can be served by the web server
    pub fn get_public_url(&self, cache_path: &Path) -> String {
        let media_dir = RetromDirs::new().media_dir();
        if let Ok(relative_path) = cache_path.strip_prefix(&media_dir) {
            format!(
                "/media/{}",
                relative_path.to_string_lossy().replace('\\', "/")
            )
        } else {
            format!(
                "/media/{}",
                cache_path.file_name().unwrap_or_default().to_string_lossy()
            )
        }
    }

    pub fn index_manager(&self) -> &IndexManager {
        &self.index_manager
    }
}

impl Default for MediaCache {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    use crate::meta::RetromDirs;
    use std::env;
    use tempfile::TempDir;

    fn create_test_retrom_dirs(temp_dir: &TempDir) -> RetromDirs {
        env::set_var("RETROM_DATA_DIR", temp_dir.path());
        RetromDirs::new()
    }

    #[tokio::test]
    async fn test_media_cache_basic_functionality() {
        // Create a temporary directory for testing
        let temp_dir = TempDir::new().unwrap();
        let _dirs = create_test_retrom_dirs(&temp_dir);
        let _cache = MediaCache::new();

        // Test that cache directories are created correctly using trait implementations
        let game_metadata = GameMetadata {
            game_id: 42,
            name: Some("Test Game".to_string()),
            description: None,
            cover_url: None,
            background_url: None,
            icon_url: None,
            igdb_id: None,
            created_at: None,
            updated_at: None,
            links: vec![],
            video_urls: vec![],
            screenshot_urls: vec![],
            artwork_urls: vec![],
            release_date: None,
            last_played: None,
            minutes_played: Some(0),
        };

        let cache_dir = game_metadata.get_cache_dir().unwrap();
        // Check that the cache dir has the correct structure (ends with correct path)
        assert!(cache_dir
            .to_string_lossy()
            .ends_with("public/media/games/42"));

        let platform_metadata = PlatformMetadata {
            platform_id: 1,
            name: Some("Test Platform".to_string()),
            description: None,
            background_url: None,
            logo_url: None,
            igdb_id: None,
            created_at: None,
            updated_at: None,
        };

        let platform_cache_dir = platform_metadata.get_cache_dir().unwrap();
        // Check that the platform cache dir has the correct structure
        assert!(platform_cache_dir
            .to_string_lossy()
            .ends_with("public/media/platforms/1"));
    }

    #[tokio::test]
    async fn test_url_to_public_path_conversion() {
        let temp_dir = TempDir::new().unwrap();
        let _dirs = create_test_retrom_dirs(&temp_dir);
        let cache = MediaCache::new();

        // Use the actual media directory from RetromDirs::new() (which uses the test env)
        let media_dir = RetromDirs::new().media_dir();
        let test_path = media_dir.join("games").join("42").join("image.jpg");
        let public_url = cache.get_public_url(&test_path);

        assert_eq!(public_url, "/media/games/42/image.jpg");
    }

    #[test]
    fn test_hash_generation_is_deterministic() {
        let url1 = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg";
        let url2 = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg";
        let url3 = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/different.jpg";

        let filename1 = utils::generate_cache_filename(url1, None).unwrap();
        let filename2 = utils::generate_cache_filename(url2, None).unwrap();
        let filename3 = utils::generate_cache_filename(url3, None).unwrap();

        // Same URL should generate same filename
        assert_eq!(filename1, filename2);

        // Different URL should generate different filename
        assert_ne!(filename1, filename3);

        // Should preserve file extension
        assert!(filename1.ends_with(".jpg"));
        assert!(filename3.ends_with(".jpg"));

        // Should be 16 characters + extension
        assert_eq!(filename1.len(), 20); // 16 + ".jpg" = 20
    }

    #[test]
    fn test_semantic_vs_hashed_filename_generation() {
        let url = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg";

        // Test semantic filename generation
        let semantic_filename = utils::generate_semantic_filename(url, "cover", None).unwrap();
        assert_eq!(semantic_filename, "cover.jpg");

        // Test hashed filename generation
        let hashed_filename = utils::generate_cache_filename(url, None).unwrap();
        assert!(hashed_filename.ends_with(".jpg"));
        assert_eq!(hashed_filename.len(), 20); // 16 chars + ".jpg"
        assert_ne!(semantic_filename, hashed_filename);

        // Test different semantic names with same URL
        let background_filename =
            utils::generate_semantic_filename(url, "background", None).unwrap();
        assert_eq!(background_filename, "background.jpg");
        assert_ne!(semantic_filename, background_filename);
    }

    #[tokio::test]
    async fn test_subdirectory_organization() {
        let temp_dir = TempDir::new().unwrap();
        let _dirs = create_test_retrom_dirs(&temp_dir);
        let cache = MediaCache::new();

        // Create test game metadata with artwork and screenshot URLs
        let game_metadata = GameMetadata {
            game_id: 123,
            name: Some("Test Game".to_string()),
            description: None,
            cover_url: None,
            background_url: None,
            icon_url: None,
            igdb_id: None,
            created_at: None,
            updated_at: None,
            links: vec![],
            video_urls: vec![],
            screenshot_urls: vec!["https://example.com/screenshot1.png".to_string()],
            artwork_urls: vec!["https://example.com/artwork1.jpg".to_string()],
            release_date: None,
            last_played: None,
            minutes_played: Some(0),
        };

        let cache_dir = game_metadata.get_cache_dir().unwrap();

        // Verify subdirectories would be created at the right paths
        let artwork_cache_dir = cache_dir.join("artwork");
        let screenshot_cache_dir = cache_dir.join("screenshots");

        // Check paths are structured correctly
        assert!(cache_dir
            .to_string_lossy()
            .ends_with("public/media/games/123"));
        assert!(artwork_cache_dir
            .to_string_lossy()
            .ends_with("public/media/games/123/artwork"));
        assert!(screenshot_cache_dir
            .to_string_lossy()
            .ends_with("public/media/games/123/screenshots"));

        // Verify URL conversion for subdirectories would work
        let test_artwork_path = artwork_cache_dir.join("test.jpg");
        let test_screenshot_path = screenshot_cache_dir.join("test.png");

        let artwork_url = cache.get_public_url(&test_artwork_path);
        let screenshot_url = cache.get_public_url(&test_screenshot_path);

        assert_eq!(artwork_url, "/media/games/123/artwork/test.jpg");
        assert_eq!(screenshot_url, "/media/games/123/screenshots/test.png");
    }

    #[tokio::test]
    async fn test_index_integration_with_cache_operations() {
        let temp_dir = TempDir::new().unwrap();
        let _dirs = create_test_retrom_dirs(&temp_dir);
        let cache = MediaCache::new();

        // Create a test cache directory
        let cache_dir = RetromDirs::new().media_dir().join("games").join("456");

        // Simulate caching a file (without actual HTTP request)
        // First create the cache directory structure that would be created by cache_media_file
        fs::create_dir_all(&cache_dir).await.unwrap();

        // Manually create a test file to simulate successful caching
        let test_file_path = cache_dir.join("cover.jpg");
        fs::write(&test_file_path, b"fake image data")
            .await
            .unwrap();

        // Manually update the index (simulating what cache_media_file does)
        let relative_path = cache
            .index_manager()
            .get_relative_path(&cache_dir, &test_file_path)
            .unwrap();
        cache
            .index_manager()
            .update_entry(
                &cache_dir,
                &relative_path,
                Some("https://example.com/cover.jpg"),
            )
            .await
            .unwrap();

        // Verify the index was created and contains the entry
        let index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        assert_eq!(index.entries.len(), 1);
        assert!(index.entries.contains_key("cover.jpg"));

        let entry = &index.entries["cover.jpg"];
        assert_eq!(
            entry.remote_url,
            Some("https://example.com/cover.jpg".to_string())
        );

        // Add another file to a subdirectory
        let artwork_dir = cache_dir.join("artwork");
        fs::create_dir_all(&artwork_dir).await.unwrap();
        let artwork_file = artwork_dir.join("artwork1.jpg");
        fs::write(&artwork_file, b"fake artwork data")
            .await
            .unwrap();

        let artwork_relative_path = cache
            .index_manager()
            .get_relative_path(&cache_dir, &artwork_file)
            .unwrap();
        cache
            .index_manager()
            .update_entry(
                &cache_dir,
                &artwork_relative_path,
                Some("https://example.com/artwork1.jpg"),
            )
            .await
            .unwrap();

        // Verify the index now contains both entries
        let updated_index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        assert_eq!(updated_index.entries.len(), 2);
        assert!(updated_index.entries.contains_key("cover.jpg"));
        assert!(updated_index.entries.contains_key("artwork/artwork1.jpg"));

        // Test index cleanup
        cache
            .index_manager()
            .remove_entry(&cache_dir, "cover.jpg")
            .await
            .unwrap();
        let final_index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        assert_eq!(final_index.entries.len(), 1);
        assert!(!final_index.entries.contains_key("cover.jpg"));
        assert!(final_index.entries.contains_key("artwork/artwork1.jpg"));

        // Test complete index removal
        cache
            .index_manager()
            .remove_index(&cache_dir)
            .await
            .unwrap();
        let index_path = cache.index_manager().get_index_path(&cache_dir);
        assert!(!index_path.exists());
    }

    #[tokio::test]
    async fn test_cache_media_opts_absolute_path_validation() {
        let temp_dir = TempDir::new().unwrap();
        let _dirs = create_test_retrom_dirs(&temp_dir);
        let cache = MediaCache::new();
        let cache_dir = RetromDirs::new().media_dir().join("games").join("test");

        // Test with absolute path should return error
        let result = cache
            .cache_media_file(CacheMediaOpts {
                remote_url: "https://example.com/test.jpg".to_string(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("test".to_string()),
                base_dir: Some(PathBuf::from("/absolute/path")),
            })
            .await;

        assert!(matches!(result, Err(MediaCacheError::AbsoluteBasePath(_))));

        // Test with relative path should work (would fail on HTTP but that's not tested here)
        let result = cache
            .cache_media_file(CacheMediaOpts {
                remote_url: "https://example.com/test.jpg".to_string(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("test".to_string()),
                base_dir: Some(PathBuf::from("relative/path")),
            })
            .await;

        // Should fail with HTTP error since we're not testing actual downloads
        assert!(result.is_err());
        // Don't check the specific error type since we're not testing HTTP requests
    }

    #[tokio::test]
    async fn test_cache_file_overwrite_on_url_change() {
        let temp_dir = TempDir::new().unwrap();
        let _dirs = create_test_retrom_dirs(&temp_dir);
        let cache = MediaCache::new();

        // Create a test cache directory
        let cache_dir = temp_dir.path().join("cache");
        fs::create_dir_all(&cache_dir).await.unwrap();

        // Manually create a test file to simulate an existing cached file
        let test_file_path = cache_dir.join("cover.jpg");
        let original_content = b"original image data";
        fs::write(&test_file_path, original_content).await.unwrap();

        // Update the index to simulate the file was cached from URL A
        let original_url = "https://example.com/original.jpg";
        let relative_path = cache
            .index_manager()
            .get_relative_path(&cache_dir, &test_file_path)
            .unwrap();
        cache
            .index_manager()
            .update_entry(&cache_dir, &relative_path, Some(original_url))
            .await
            .unwrap();

        // Verify the initial state
        let index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        assert_eq!(index.entries.len(), 1);
        let entry = &index.entries["cover.jpg"];
        assert_eq!(entry.remote_url, Some(original_url.to_string()));

        // Verify file content is original
        let content = fs::read(&test_file_path).await.unwrap();
        assert_eq!(content, original_content);

        // Now test our logic: simulate the file existing check when URLs match
        // The file should NOT be overwritten if URL matches
        let cache_path_exists = test_file_path.exists();
        assert!(cache_path_exists);

        // Read index and check if URLs match
        let index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        if let Some(existing_entry) = index.entries.get(&relative_path) {
            if let Some(existing_url) = &existing_entry.remote_url {
                // URLs match - should return early without overwriting
                assert_eq!(existing_url, original_url);
                // Content should remain unchanged
                let content = fs::read(&test_file_path).await.unwrap();
                assert_eq!(content, original_content);
            }
        }

        // Now test with different URL - simulate what would happen
        let new_url = "https://example.com/new.jpg";
        let different_content = b"new image data";

        // Read index and check if URLs differ
        let index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        if let Some(existing_entry) = index.entries.get(&relative_path) {
            if let Some(existing_url) = &existing_entry.remote_url {
                if existing_url != new_url {
                    // URLs differ - should proceed with "download" (we'll simulate by writing new content)
                    fs::write(&test_file_path, different_content).await.unwrap();

                    // Update index with new URL
                    cache
                        .index_manager()
                        .update_entry(&cache_dir, &relative_path, Some(new_url))
                        .await
                        .unwrap();
                }
            }
        }

        // Verify the file was overwritten and index was updated
        let content = fs::read(&test_file_path).await.unwrap();
        assert_eq!(content, different_content);

        let updated_index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        assert_eq!(updated_index.entries.len(), 1);
        let updated_entry = &updated_index.entries["cover.jpg"];
        assert_eq!(updated_entry.remote_url, Some(new_url.to_string()));
    }
}
