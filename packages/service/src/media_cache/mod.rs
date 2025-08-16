use crate::meta::RetromDirs;
use caesium::parameters::CSParameters;
use reqwest::StatusCode;
use std::{
    path::{Path, PathBuf},
    str::FromStr,
};
use thiserror::Error;
use tokio::fs;
use tokio_retry::Condition;
use tracing::{debug, instrument, warn};

pub mod cacheable_media;
pub mod index;
pub mod utils;

use index::{IndexEntry, IndexManager};

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
    #[error("This should never happen: {0}")]
    Infallible(#[from] std::convert::Infallible),
    #[error("Join error: {0}")]
    JoinError(#[from] tokio::task::JoinError),
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

/// Ensure the cache directory exists
#[instrument(level = "debug")]
async fn ensure_cache_dir(cache_dir: &PathBuf) -> Result<()> {
    if !cache_dir.exists() {
        debug!("Creating cache directory: {:?}", cache_dir);
        fs::create_dir_all(cache_dir)
            .await
            .map_err(|_e| MediaCacheError::DirectoryCreation {
                path: cache_dir.to_string_lossy().to_string(),
            })?;
    }
    Ok(())
}

/// Convert a local cache path to a public URL that can be served by the web server
pub fn get_public_url(cache_path: &Path) -> Result<String> {
    let media_dir = RetromDirs::new().media_dir();
    if let Ok(relative_path) = cache_path.strip_prefix(&media_dir) {
        Ok(PathBuf::from_str("media")?
            .join(relative_path)
            .to_string_lossy()
            .into())
    } else {
        Err(MediaCacheError::NonCacheableItem(format!(
            "Cache path {cache_path:?} is not under media directory {media_dir:?}"
        )))
    }
}

impl CacheMediaOpts {
    pub async fn get_item_path(&self) -> Result<PathBuf> {
        let storage_dir = match &self.base_dir {
            Some(base_dir) => &self.cache_dir.join(base_dir),
            None => &self.cache_dir,
        };

        ensure_cache_dir(storage_dir).await?;

        let filename = match &self.semantic_name {
            Some(name) => utils::generate_semantic_filename(&self.remote_url, name, Some("jpg"))?,
            None => utils::generate_cache_filename(&self.remote_url, Some("jpg"))?,
        };

        Ok(storage_dir.join(filename))
    }
}

pub struct MediaCache {
    client: reqwest::Client,
    // compression_threads: Arc<ThreadPool>,
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

        // let thread_count = std::thread::available_parallelism()
        //     .map(|n| std::cmp::max(n.get() - 1, 1))
        //     .unwrap_or(0); // 0 -> default thread count determined by rayon

        // let compression_threads = Arc::new(
        //     rayon::ThreadPoolBuilder::new()
        //         .num_threads(thread_count)
        //         .build()
        //         .expect("Failed to create compression thread pool"),
        // );

        Self {
            client,
            // compression_threads,
            index_manager: IndexManager::new(),
        }
    }

    #[instrument(skip(self))]
    pub async fn is_cache_item_stale(&self, opts: &CacheMediaOpts) -> Result<bool> {
        let cache_path = opts.get_item_path().await?;

        if cache_path.exists() {
            debug!("Media file already cached: {:?}", cache_path);
            return Ok(false);
        }

        debug!("Media file not cached, needs download: {:?}", cache_path);
        Ok(true)
    }

    async fn get_item_index_entry(
        &self,
        opts: &CacheMediaOpts,
    ) -> Result<Option<(String, IndexEntry)>> {
        let relative_path = self.index_manager.get_relative_path(opts).await?;

        let mut index = self.index_manager.read_index(&opts.cache_dir).await?;
        Ok(index.entries.remove_entry(&relative_path))
    }

    /// Download and cache a media file, return the local file path
    /// If semantic_name is provided, uses semantic filename (e.g., "cover.jpg")
    /// Otherwise uses hashed filename for uniqueness
    #[instrument(skip(self))]
    pub async fn cache_media_file(&self, opts: &CacheMediaOpts) -> Result<PathBuf> {
        if let Some(ref base_dir) = opts.base_dir {
            if base_dir.is_absolute() {
                return Err(MediaCacheError::AbsoluteBasePath(
                    base_dir.display().to_string(),
                ));
            }
        }

        let cache_path = opts.get_item_path().await?;

        if cache_path.exists() {
            debug!("Media file already cached: {:?}", cache_path);

            if self.get_item_index_entry(opts).await?.is_some() {
                let is_valid = self.index_manager.is_entry_valid(opts).await?;

                // Update timestamps and return early if the index is still valid
                if is_valid {
                    if let Err(e) = self.index_manager.update_entry(opts).await {
                        warn!(
                            "Failed to update index for existing file {:?}: {}",
                            cache_path, e
                        );
                    }

                    return Ok(cache_path);
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

        let response = match self.fetch_media(opts).await {
            Ok(res) => res,
            Err(MediaCacheError::NotFound(_)) => return Ok(cache_path),
            Err(e) => return Err(e),
        };

        let bytes = response.bytes().await?;

        fs::write(&cache_path, bytes).await?;

        let mut params = CSParameters::new();
        params.keep_metadata = false;

        // self.compress_media(&cache_path, params).await?;

        if let Err(e) = self.index_manager.update_entry(opts).await {
            warn!("Failed to update cache index for {cache_path:?}: {e:?}");
        }

        debug!("Media file cached successfully: {:?}", cache_path);
        Ok(cache_path)
    }

    async fn fetch_media(&self, opts: &CacheMediaOpts) -> Result<reqwest::Response> {
        let strategy = tokio_retry::strategy::ExponentialBackoff::from_millis(500)
            .max_delay(std::time::Duration::from_secs(10))
            .take(3);

        let retry = RetryCondition {};

        tokio_retry::RetryIf::spawn(
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
        .await
    }

    // #[instrument(skip_all,
    //     fields(png.quality = params.png.quality.to_i64(),
    //            jpeg.quality = params.jpeg.quality.to_i64(),
    //            optimization_level = params.png.optimization_level,
    //            file_type = file.as_ref().extension().and_then(|s| s.to_str()).unwrap_or("unknown")
    //     )
    // )]
    // async fn compress_media(&self, file: impl AsRef<Path>, params: CSParameters) -> Result<()> {
    //     let (tx, rx) = tokio::sync::oneshot::channel();
    //
    //     let fp: &Path = file.as_ref();
    //     let temp_path = fp.with_extension("compressed");
    //
    //     debug!("Spawning compression thread");
    //
    //     let span = tracing::info_span!("compression_thread");
    //
    //     let path_str = fp.to_string_lossy().to_string();
    //     let out_path_str = temp_path.to_string_lossy().to_string();
    //
    //     let compression_threads = self.compression_threads.clone();
    //     tokio::task::spawn_blocking(move || {
    //         compression_threads.spawn(move || {
    //             span.in_scope(|| {
    //                 info!("Beginning compression of media file");
    //
    //                 let res = compress(path_str, out_path_str, &params);
    //                 info!("Compression completed");
    //
    //                 let _ = tx.send(res);
    //             });
    //         })
    //     })
    //     .await?;
    //
    //     match rx.await {
    //         Ok(Ok(res)) => {
    //             info!("Media compressed successfully");
    //             tokio::fs::remove_file(fp).await?;
    //             tokio::fs::rename(temp_path, fp).await?;
    //             Ok(res)
    //         }
    //         _ => {
    //             warn!("Failed to compress media, returning original data");
    //             Err(MediaCacheError::Io(std::io::Error::other(
    //                 "Compression failed",
    //             )))
    //         }
    //     }
    // }

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
    use cacheable_media::CacheableMetadata;
    use retrom_codegen::retrom::{GameMetadata, PlatformMetadata};
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_media_cache_basic_functionality() {
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
        assert!(cache_dir.to_string_lossy().ends_with("media/games/42"));

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
            .ends_with("media/platforms/1"));
    }

    #[tokio::test]
    async fn test_url_to_public_path_conversion() {
        // Use the actual media directory from RetromDirs::new() (which uses the test env)
        let media_dir = RetromDirs::new().media_dir();
        let test_path = media_dir.join("games").join("42").join("image.jpg");
        let public_url = get_public_url(&test_path).unwrap();

        assert_eq!(public_url, "media/games/42/image.jpg");
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
        assert!(cache_dir.to_string_lossy().ends_with("media/games/123"));
        assert!(artwork_cache_dir
            .to_string_lossy()
            .ends_with("media/games/123/artwork"));
        assert!(screenshot_cache_dir
            .to_string_lossy()
            .ends_with("media/games/123/screenshots"));

        // Verify URL conversion for subdirectories would work
        let test_artwork_path = artwork_cache_dir.join("test.jpg");
        let test_screenshot_path = screenshot_cache_dir.join("test.png");

        let artwork_url = get_public_url(&test_artwork_path).unwrap();
        let screenshot_url = get_public_url(&test_screenshot_path).unwrap();

        assert_eq!(artwork_url, "media/games/123/artwork/test.jpg");
        assert_eq!(screenshot_url, "media/games/123/screenshots/test.png");
    }

    #[tokio::test]
    async fn test_index_integration_with_cache_operations() {
        let cache = MediaCache::new();

        let game_metadata = GameMetadata {
            game_id: 123,
            ..Default::default()
        };

        // Create a test cache directory
        let cache_dir = game_metadata.get_cache_dir().unwrap();

        let opts = CacheMediaOpts {
            remote_url: "https://example.com/cover.jpg".to_string(),
            cache_dir: cache_dir.clone(),
            semantic_name: Some("cover".to_string()),
            base_dir: None,
        };

        // Simulate caching a file (without actual HTTP request)
        // First create the cache directory structure that would be created by cache_media_file
        fs::create_dir_all(&cache_dir).await.unwrap();

        // Manually create a test file to simulate successful caching
        let file_path = opts.get_item_path().await.unwrap();
        fs::write(&file_path, b"fake image data").await.unwrap();

        // Manually update the index (simulating what cache_media_file does)
        cache.index_manager().update_entry(&opts).await.unwrap();

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
        let opts_2 = CacheMediaOpts {
            remote_url: "https://example.com/artwork1.jpg".to_string(),
            cache_dir: cache_dir.clone(),
            semantic_name: Some("artwork1".to_string()),
            base_dir: Some(PathBuf::from("artwork")),
        };

        let artwork_file = opts_2.get_item_path().await.unwrap();
        fs::write(&artwork_file, b"fake artwork data")
            .await
            .unwrap();

        cache.index_manager().update_entry(&opts_2).await.unwrap();

        // Verify the index now contains both entries
        let updated_index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        assert_eq!(updated_index.entries.len(), 2);
        assert!(updated_index.entries.contains_key("cover.jpg"));
        assert!(updated_index.entries.contains_key("artwork/artwork1.jpg"));

        // Test index cleanup
        cache.index_manager().remove_entry(&opts).await.unwrap();

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
        let cache = MediaCache::new();
        let cache_dir = RetromDirs::new().media_dir().join("games").join("test");

        // Test with absolute path should return error
        let result = cache
            .cache_media_file(&CacheMediaOpts {
                remote_url: "https://example.com/test.jpg".to_string(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("test".to_string()),
                base_dir: Some(PathBuf::from("/absolute/path")),
            })
            .await;

        assert!(matches!(result, Err(MediaCacheError::AbsoluteBasePath(_))));
    }

    #[tokio::test]
    async fn test_cache_file_overwrite_on_url_change() {
        let temp_dir = TempDir::new().unwrap();
        let cache = MediaCache::new();

        // Create a test cache directory
        let cache_dir = temp_dir.path().join("cache");
        fs::create_dir_all(&cache_dir).await.unwrap();

        let original_url = "https://example.com/original.jpg";
        let opts = CacheMediaOpts {
            remote_url: original_url.to_string(),
            cache_dir: cache_dir.clone(),
            semantic_name: Some("cover".to_string()),
            base_dir: None,
        };

        // Manually create a test file to simulate an existing cached file
        let test_file_path = opts.get_item_path().await.unwrap();
        let original_content = b"original image data";
        fs::write(&test_file_path, original_content).await.unwrap();

        // Update the index to simulate the file was cached from URL A
        cache.index_manager().update_entry(&opts).await.unwrap();

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
        if let Some(existing_entry) = index.entries.get("cover.jpg") {
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
        let new_opts = CacheMediaOpts {
            remote_url: new_url.to_string(),
            cache_dir: cache_dir.clone(),
            semantic_name: Some("cover".to_string()),
            base_dir: None,
        };

        let different_content = b"new image data";

        // Read index and check if URLs differ
        let index = cache.index_manager().read_index(&cache_dir).await.unwrap();
        if let Some(existing_entry) = index.entries.get("cover.jpg") {
            if let Some(existing_url) = &existing_entry.remote_url {
                if existing_url != new_url {
                    // URLs differ - should proceed with "download" (we'll simulate by writing new content)
                    fs::write(&test_file_path, different_content).await.unwrap();

                    // Update index with new URL
                    cache.index_manager().update_entry(&new_opts).await.unwrap();
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
