use std::path::PathBuf;

use retrom_codegen::retrom::{GameMetadata, PlatformMetadata};
use thiserror::Error;
use tokio::fs;
use tracing::{debug, instrument, warn};

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

pub struct MediaCache {
    data_dir: PathBuf,
    client: reqwest::Client,
}

impl MediaCache {
    pub fn new(data_dir: PathBuf) -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self { data_dir, client }
    }

    /// Get the cache directory for a specific platform and game
    pub fn get_cache_dir(&self, platform_id: i32, game_id: i32) -> PathBuf {
        self.data_dir
            .join("metadata")
            .join(platform_id.to_string())
            .join(game_id.to_string())
    }

    /// Get the cache directory for platform metadata
    pub fn get_platform_cache_dir(&self, platform_id: i32) -> PathBuf {
        self.data_dir
            .join("metadata")
            .join(platform_id.to_string())
            .join("platform")
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
    #[instrument(level = "debug", skip(self))]
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

        // Download the file
        let response = self.client.get(url).send().await?;
        if !response.status().is_success() {
            warn!("Failed to download media file: {} (status: {})", url, response.status());
            return Err(MediaCacheError::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("HTTP error: {}", response.status()),
            )));
        }

        let bytes = response.bytes().await?;
        fs::write(&cache_path, bytes).await?;

        debug!("Media file cached successfully: {:?}", cache_path);
        Ok(cache_path)
    }

    /// Cache all media files for game metadata and return updated metadata with local paths
    #[instrument(level = "debug", skip(self))]
    pub async fn cache_game_metadata_media(&self, metadata: &GameMetadata, platform_id: i32) -> Result<GameMetadata> {
        let game_id = metadata.game_id;
        let cache_dir = self.get_cache_dir(platform_id, game_id);
        let mut updated_metadata = metadata.clone();

            // Cache cover image
            if let Some(ref cover_url) = metadata.cover_url {
                if let Ok(cached_path) = self.cache_media_file(cover_url, &cache_dir).await {
                    updated_metadata.cover_url = Some(self.get_public_url(&cached_path));
                }
            }

            // Cache background image
            if let Some(ref background_url) = metadata.background_url {
                if let Ok(cached_path) = self.cache_media_file(background_url, &cache_dir).await {
                    updated_metadata.background_url = Some(self.get_public_url(&cached_path));
                }
            }

            // Cache icon image
            if let Some(ref icon_url) = metadata.icon_url {
                if let Ok(cached_path) = self.cache_media_file(icon_url, &cache_dir).await {
                    updated_metadata.icon_url = Some(self.get_public_url(&cached_path));
                }
            }

            // Cache artwork images
            let mut cached_artwork_urls = Vec::new();
            for artwork_url in &metadata.artwork_urls {
                if let Ok(cached_path) = self.cache_media_file(artwork_url, &cache_dir).await {
                    cached_artwork_urls.push(self.get_public_url(&cached_path));
                } else {
                    // Keep original URL if caching fails
                    cached_artwork_urls.push(artwork_url.clone());
                }
            }
            updated_metadata.artwork_urls = cached_artwork_urls;

            // Cache screenshot images
            let mut cached_screenshot_urls = Vec::new();
            for screenshot_url in &metadata.screenshot_urls {
                if let Ok(cached_path) = self.cache_media_file(screenshot_url, &cache_dir).await {
                    cached_screenshot_urls.push(self.get_public_url(&cached_path));
                } else {
                    // Keep original URL if caching fails
                    cached_screenshot_urls.push(screenshot_url.clone());
                }
            }
            updated_metadata.screenshot_urls = cached_screenshot_urls;

        // Note: video_urls are typically YouTube embeds, so we don't cache them
        // They remain unchanged in the updated metadata

        Ok(updated_metadata)
    }

    /// Cache all media files for updated game metadata and return updated metadata with local paths
    #[instrument(level = "debug", skip(self))]
    pub async fn cache_updated_game_metadata_media(&self, metadata: &retrom_codegen::retrom::UpdatedGameMetadata, platform_id: i32) -> Result<retrom_codegen::retrom::UpdatedGameMetadata> {
        let game_id = metadata.game_id;
        let cache_dir = self.get_cache_dir(platform_id, game_id);
        let mut updated_metadata = metadata.clone();

        // Cache cover image
        if let Some(ref cover_url) = metadata.cover_url {
            if let Ok(cached_path) = self.cache_media_file(cover_url, &cache_dir).await {
                updated_metadata.cover_url = Some(self.get_public_url(&cached_path));
            }
        }

        // Cache background image
        if let Some(ref background_url) = metadata.background_url {
            if let Ok(cached_path) = self.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(self.get_public_url(&cached_path));
            }
        }

        // Cache icon image
        if let Some(ref icon_url) = metadata.icon_url {
            if let Ok(cached_path) = self.cache_media_file(icon_url, &cache_dir).await {
                updated_metadata.icon_url = Some(self.get_public_url(&cached_path));
            }
        }

        // Cache artwork images
        let mut cached_artwork_urls = Vec::new();
        for artwork_url in &metadata.artwork_urls {
            if let Ok(cached_path) = self.cache_media_file(artwork_url, &cache_dir).await {
                cached_artwork_urls.push(self.get_public_url(&cached_path));
            } else {
                // Keep original URL if caching fails
                cached_artwork_urls.push(artwork_url.clone());
            }
        }
        updated_metadata.artwork_urls = cached_artwork_urls;

        // Cache screenshot images
        let mut cached_screenshot_urls = Vec::new();
        for screenshot_url in &metadata.screenshot_urls {
            if let Ok(cached_path) = self.cache_media_file(screenshot_url, &cache_dir).await {
                cached_screenshot_urls.push(self.get_public_url(&cached_path));
            } else {
                // Keep original URL if caching fails
                cached_screenshot_urls.push(screenshot_url.clone());
            }
        }
        updated_metadata.screenshot_urls = cached_screenshot_urls;

        // Note: video_urls are typically YouTube embeds, so we don't cache them
        // They remain unchanged in the updated metadata

        Ok(updated_metadata)
    }

    /// Cache all media files for platform metadata and return updated metadata with local paths
    #[instrument(level = "debug", skip(self))]
    pub async fn cache_platform_metadata_media(&self, metadata: &PlatformMetadata) -> Result<PlatformMetadata> {
        let platform_id = metadata.platform_id;
        let cache_dir = self.get_platform_cache_dir(platform_id);
        let mut updated_metadata = metadata.clone();

            // Cache background image
            if let Some(ref background_url) = metadata.background_url {
                if let Ok(cached_path) = self.cache_media_file(background_url, &cache_dir).await {
                    updated_metadata.background_url = Some(self.get_public_url(&cached_path));
                }
            }

            // Cache logo image
            if let Some(ref logo_url) = metadata.logo_url {
                if let Ok(cached_path) = self.cache_media_file(logo_url, &cache_dir).await {
                    updated_metadata.logo_url = Some(self.get_public_url(&cached_path));
                }
            }

        Ok(updated_metadata)
    }

    /// Cache all media files for updated platform metadata and return updated metadata with local paths
    #[instrument(level = "debug", skip(self))]
    pub async fn cache_updated_platform_metadata_media(&self, metadata: &retrom_codegen::retrom::UpdatedPlatformMetadata) -> Result<retrom_codegen::retrom::UpdatedPlatformMetadata> {
        let platform_id = metadata.platform_id;
        let cache_dir = self.get_platform_cache_dir(platform_id);
        let mut updated_metadata = metadata.clone();

        // Cache background image
        if let Some(ref background_url) = metadata.background_url {
            if let Ok(cached_path) = self.cache_media_file(background_url, &cache_dir).await {
                updated_metadata.background_url = Some(self.get_public_url(&cached_path));
            }
        }

        // Cache logo image
        if let Some(ref logo_url) = metadata.logo_url {
            if let Ok(cached_path) = self.cache_media_file(logo_url, &cache_dir).await {
                updated_metadata.logo_url = Some(self.get_public_url(&cached_path));
            }
        }

        Ok(updated_metadata)
    }

    /// Convert a local cache path to a public URL that can be served by the web server
    fn get_public_url(&self, cache_path: &PathBuf) -> String {
        // Convert absolute cache path to relative path from data_dir
        if let Ok(relative_path) = cache_path.strip_prefix(&self.data_dir) {
            format!("/media/{}", relative_path.to_string_lossy().replace('\\', "/"))
        } else {
            // Fallback: use just the filename
            format!("/media/{}", cache_path.file_name().unwrap_or_default().to_string_lossy())
        }
    }

    /// Clean up cached files for a game
    #[instrument(level = "debug", skip(self))]
    pub async fn cleanup_game_cache(&self, platform_id: i32, game_id: i32) -> Result<()> {
        let cache_dir = self.get_cache_dir(platform_id, game_id);
        if cache_dir.exists() {
            debug!("Cleaning up cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }

    /// Clean up cached files for a platform
    #[instrument(level = "debug", skip(self))]
    pub async fn cleanup_platform_cache(&self, platform_id: i32) -> Result<()> {
        let cache_dir = self.get_platform_cache_dir(platform_id);
        if cache_dir.exists() {
            debug!("Cleaning up platform cache directory: {:?}", cache_dir);
            fs::remove_dir_all(&cache_dir).await?;
        }
        Ok(())
    }
}