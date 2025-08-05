use std::path::PathBuf;
use std::sync::Arc;

use retrom_codegen::retrom::{GameMetadata, PlatformMetadata};
use thiserror::Error;
use tokio::fs;
use tracing::{debug, instrument, warn};

use crate::meta::RetromDirs;

pub mod utils;

#[derive(Error, Debug)]
pub enum MediaCacheError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("HTTP request error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("URL parse error: {0}")]
    UrlParse(#[from] url::ParseError),
    #[error("Invalid file extension")]
    InvalidExtension,
    #[error("Directory creation failed: {path}")]
    DirectoryCreation { path: String },
}

pub type Result<T> = std::result::Result<T, MediaCacheError>;

/// Trait for metadata types that can be cached
pub trait CacheableMetadata: Clone + Send + Sync {
    /// Get the cache directory for this metadata
    fn get_cache_dir(&self) -> PathBuf;

    /// Cache all media files for this metadata and return updated metadata with local paths
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self>;

    /// Clean up cached files for this metadata
    async fn clean_cache(&self) -> Result<()>;
}

impl CacheableMetadata for GameMetadata {
    fn get_cache_dir(&self) -> PathBuf {
        RetromDirs::new().media_dir().join("games").join(self.game_id.to_string())
    }

    #[instrument(level = "info", skip(cache))]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self> {
        let cache_dir = self.get_cache_dir();
        let mut updated_metadata = self.clone();

        if let Some(ref cover_url) = self.cover_url {
            if let Ok(cached_path) = cache.cache_media_file(cover_url, &cache_dir).await {
                updated_metadata.cover_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref background_url) = self.background_url {
            if let Ok(cached_path) = cache.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref icon_url) = self.icon_url {
            if let Ok(cached_path) = cache.cache_media_file(icon_url, &cache_dir).await {
                updated_metadata.icon_url = Some(cache.get_public_url(&cached_path));
            }
        }

        let mut cached_artwork_urls = Vec::new();
        for artwork_url in &self.artwork_urls {
            if let Ok(cached_path) = cache.cache_media_file(artwork_url, &cache_dir).await {
                cached_artwork_urls.push(cache.get_public_url(&cached_path));
            } else {
                cached_artwork_urls.push(artwork_url.clone());
            }
        }
        updated_metadata.artwork_urls = cached_artwork_urls;

        let mut cached_screenshot_urls = Vec::new();
        for screenshot_url in &self.screenshot_urls {
            if let Ok(cached_path) = cache.cache_media_file(screenshot_url, &cache_dir).await {
                cached_screenshot_urls.push(cache.get_public_url(&cached_path));
            } else {
                cached_screenshot_urls.push(screenshot_url.clone());
            }
        }
        updated_metadata.screenshot_urls = cached_screenshot_urls;

        Ok(updated_metadata)
    }

    async fn clean_cache(&self) -> Result<()> {
        let cache_dir = RetromDirs::new().media_dir().join("games").join(self.game_id.to_string());
        if cache_dir.exists() {
            debug!("Cleaning up cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::UpdatedGameMetadata {
    fn get_cache_dir(&self) -> PathBuf {
        RetromDirs::new().media_dir().join("games").join(self.game_id.to_string())
    }

    #[instrument(level = "info", skip(cache))]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self> {
        let cache_dir = self.get_cache_dir();
        let mut updated_metadata = self.clone();

        if let Some(ref cover_url) = self.cover_url {
            if let Ok(cached_path) = cache.cache_media_file(cover_url, &cache_dir).await {
                updated_metadata.cover_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref background_url) = self.background_url {
            if let Ok(cached_path) = cache.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref icon_url) = self.icon_url {
            if let Ok(cached_path) = cache.cache_media_file(icon_url, &cache_dir).await {
                updated_metadata.icon_url = Some(cache.get_public_url(&cached_path));
            }
        }

        let mut cached_artwork_urls = Vec::new();
        for artwork_url in &self.artwork_urls {
            if let Ok(cached_path) = cache.cache_media_file(artwork_url, &cache_dir).await {
                cached_artwork_urls.push(cache.get_public_url(&cached_path));
            } else {
                cached_artwork_urls.push(artwork_url.clone());
            }
        }
        updated_metadata.artwork_urls = cached_artwork_urls;

        let mut cached_screenshot_urls = Vec::new();
        for screenshot_url in &self.screenshot_urls {
            if let Ok(cached_path) = cache.cache_media_file(screenshot_url, &cache_dir).await {
                cached_screenshot_urls.push(cache.get_public_url(&cached_path));
            } else {
                cached_screenshot_urls.push(screenshot_url.clone());
            }
        }
        updated_metadata.screenshot_urls = cached_screenshot_urls;

        Ok(updated_metadata)
    }

    async fn clean_cache(&self) -> Result<()> {
        let cache_dir = RetromDirs::new().media_dir().join("games").join(self.game_id.to_string());
        if cache_dir.exists() {
            debug!("Cleaning up cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}

impl CacheableMetadata for PlatformMetadata {
    fn get_cache_dir(&self) -> PathBuf {
        RetromDirs::new().media_dir().join("platforms").join(self.platform_id.to_string())
    }

    #[instrument(level = "info", skip(cache))]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self> {
        let cache_dir = self.get_cache_dir();
        let mut updated_metadata = self.clone();

        if let Some(ref background_url) = self.background_url {
            if let Ok(cached_path) = cache.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref logo_url) = self.logo_url {
            if let Ok(cached_path) = cache.cache_media_file(logo_url, &cache_dir).await {
                updated_metadata.logo_url = Some(cache.get_public_url(&cached_path));
            }
        }

        Ok(updated_metadata)
    }

    async fn clean_cache(&self) -> Result<()> {
        let cache_dir = RetromDirs::new().media_dir().join("platforms").join(self.platform_id.to_string());
        if cache_dir.exists() {
            debug!("Cleaning up platform cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::UpdatedPlatformMetadata {
    fn get_cache_dir(&self) -> PathBuf {
        RetromDirs::new().media_dir().join("platforms").join(self.platform_id.to_string())
    }

    #[instrument(level = "info", skip(cache))]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self> {
        let cache_dir = self.get_cache_dir();
        let mut updated_metadata = self.clone();

        if let Some(ref background_url) = self.background_url {
            if let Ok(cached_path) = cache.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref logo_url) = self.logo_url {
            if let Ok(cached_path) = cache.cache_media_file(logo_url, &cache_dir).await {
                updated_metadata.logo_url = Some(cache.get_public_url(&cached_path));
            }
        }

        Ok(updated_metadata)
    }

    async fn clean_cache(&self) -> Result<()> {
        let cache_dir = RetromDirs::new().media_dir().join("platforms").join(self.platform_id.to_string());
        if cache_dir.exists() {
            debug!("Cleaning up platform cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::NewGameMetadata {
    fn get_cache_dir(&self) -> PathBuf {
        RetromDirs::new().media_dir().join("games").join(self.game_id.unwrap_or(0).to_string())
    }

    #[instrument(level = "info", skip(cache))]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self> {
        let cache_dir = self.get_cache_dir();
        let mut updated_metadata = self.clone();

        if let Some(ref cover_url) = self.cover_url {
            if let Ok(cached_path) = cache.cache_media_file(cover_url, &cache_dir).await {
                updated_metadata.cover_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref background_url) = self.background_url {
            if let Ok(cached_path) = cache.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref icon_url) = self.icon_url {
            if let Ok(cached_path) = cache.cache_media_file(icon_url, &cache_dir).await {
                updated_metadata.icon_url = Some(cache.get_public_url(&cached_path));
            }
        }

        let mut cached_artwork_urls = Vec::new();
        for artwork_url in &self.artwork_urls {
            if let Ok(cached_path) = cache.cache_media_file(artwork_url, &cache_dir).await {
                cached_artwork_urls.push(cache.get_public_url(&cached_path));
            } else {
                cached_artwork_urls.push(artwork_url.clone());
            }
        }
        updated_metadata.artwork_urls = cached_artwork_urls;

        let mut cached_screenshot_urls = Vec::new();
        for screenshot_url in &self.screenshot_urls {
            if let Ok(cached_path) = cache.cache_media_file(screenshot_url, &cache_dir).await {
                cached_screenshot_urls.push(cache.get_public_url(&cached_path));
            } else {
                cached_screenshot_urls.push(screenshot_url.clone());
            }
        }
        updated_metadata.screenshot_urls = cached_screenshot_urls;

        Ok(updated_metadata)
    }

    async fn clean_cache(&self) -> Result<()> {
        let cache_dir = RetromDirs::new().media_dir().join("games").join(self.game_id.unwrap_or(0).to_string());
        if cache_dir.exists() {
            debug!("Cleaning up cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}

impl CacheableMetadata for retrom_codegen::retrom::NewPlatformMetadata {
    fn get_cache_dir(&self) -> PathBuf {
        RetromDirs::new().media_dir().join("platforms").join(self.platform_id.unwrap_or(0).to_string())
    }

    #[instrument(level = "info", skip(cache))]
    async fn cache_metadata(&self, cache: Arc<MediaCache>) -> Result<Self> {
        let cache_dir = self.get_cache_dir();
        let mut updated_metadata = self.clone();

        if let Some(ref background_url) = self.background_url {
            if let Ok(cached_path) = cache.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(cache.get_public_url(&cached_path));
            }
        }

        if let Some(ref logo_url) = self.logo_url {
            if let Ok(cached_path) = cache.cache_media_file(logo_url, &cache_dir).await {
                updated_metadata.logo_url = Some(cache.get_public_url(&cached_path));
            }
        }

        Ok(updated_metadata)
    }

    async fn clean_cache(&self) -> Result<()> {
        let cache_dir = RetromDirs::new().media_dir().join("platforms").join(self.platform_id.unwrap_or(0).to_string());
        if cache_dir.exists() {
            debug!("Cleaning up platform cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}

pub struct MediaCache {
    client: reqwest::Client,
}

impl MediaCache {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self { client }
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
    #[instrument(level = "info", skip(self))]
    pub async fn cache_media_file(&self, url: &str, cache_dir: &PathBuf) -> Result<PathBuf> {
        self.ensure_cache_dir(cache_dir).await?;

        let filename = utils::generate_cache_filename(url)?;
        let cache_path = cache_dir.join(&filename);

        // If file already exists, return the cached path
        if cache_path.exists() {
            debug!("Media file already cached: {:?}", cache_path);
            return Ok(cache_path);
        }

        debug!("Downloading media file: {} -> {:?}", url, cache_path);

        let retry_strategy = tokio_retry::strategy::ExponentialBackoff::from_millis(500)
            .max_delay(std::time::Duration::from_secs(10))
            .take(3);

        let result = tokio_retry::Retry::spawn(retry_strategy, || async {
            let response = self.client.get(url).send().await?;
            if !response.status().is_success() {
                warn!("Failed to download media file: {} (status: {})", url, response.status());
                return Err(MediaCacheError::Io(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("HTTP error: {}", response.status()),
                )));
            }
            
            let bytes = response.bytes().await?;
            Ok(bytes)
        }).await?;

        fs::write(&cache_path, result).await?;

        debug!("Media file cached successfully: {:?}", cache_path);
        Ok(cache_path)
    }

    /// Convert a local cache path to a public URL that can be served by the web server
    pub fn get_public_url(&self, cache_path: &PathBuf) -> String {
        let media_dir = RetromDirs::new().media_dir();
        if let Ok(relative_path) = cache_path.strip_prefix(&media_dir) {
            format!("/media/{}", relative_path.to_string_lossy().replace('\\', "/"))
        } else {
            format!("/media/{}", cache_path.file_name().unwrap_or_default().to_string_lossy())
        }
    }
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    use crate::meta::RetromDirs;
    use tempfile::TempDir;
    use std::env;

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
        
        let cache_dir = game_metadata.get_cache_dir();
        assert_eq!(
            cache_dir,
            temp_dir.path().join("public").join("media").join("games").join("42")
        );

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
        
        let platform_cache_dir = platform_metadata.get_cache_dir();
        assert_eq!(
            platform_cache_dir,
            temp_dir.path().join("public").join("media").join("platforms").join("1")
        );
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

        let filename1 = utils::generate_cache_filename(url1).unwrap();
        let filename2 = utils::generate_cache_filename(url2).unwrap();
        let filename3 = utils::generate_cache_filename(url3).unwrap();

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
}