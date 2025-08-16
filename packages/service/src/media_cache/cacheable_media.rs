use super::{CacheMediaOpts, MediaCacheError, Result};
use crate::meta::RetromDirs;
use retrom_codegen::retrom::{GameMetadata, PlatformMetadata};
use std::path::PathBuf;
use tracing::{debug, warn};

/// Trait for metadata types that can be cached
pub trait CacheableMetadata: Clone + Send + Sync {
    /// Get the cache directory for this metadata
    fn get_cache_dir(&self) -> Option<PathBuf>;

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        vec![]
    }

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
                tokio::fs::remove_dir_all(&cache_dir).await?;
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

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                warn!("No cache directory available for GameMetadata");
                return opts;
            }
        };

        if let Some(cover_url) = &self.cover_url {
            opts.push(CacheMediaOpts {
                remote_url: cover_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("cover".to_string()),
                base_dir: None,
            });
        }

        if let Some(background_url) = &self.background_url {
            opts.push(CacheMediaOpts {
                remote_url: background_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("background".to_string()),
                base_dir: None,
            });
        }

        if let Some(icon_url) = &self.icon_url {
            opts.push(CacheMediaOpts {
                remote_url: icon_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("icon".to_string()),
                base_dir: None,
            });
        }

        for artwork_url in &self.artwork_urls {
            opts.push(CacheMediaOpts {
                remote_url: artwork_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: None,
                base_dir: Some(PathBuf::from("artwork")),
            });
        }

        for screenshot_url in &self.screenshot_urls {
            opts.push(CacheMediaOpts {
                remote_url: screenshot_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: None,
                base_dir: Some(PathBuf::from("screenshots")),
            });
        }

        opts
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

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let game_metadata = GameMetadata {
            cover_url: self.cover_url.clone(),
            background_url: self.background_url.clone(),
            icon_url: self.icon_url.clone(),
            artwork_urls: self.artwork_urls.clone(),
            screenshot_urls: self.screenshot_urls.clone(),
            ..Default::default()
        };

        game_metadata.get_cacheable_media_opts()
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

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                warn!("No cache directory available for GameMetadata");
                return opts;
            }
        };

        if let Some(background_url) = &self.background_url {
            opts.push(CacheMediaOpts {
                remote_url: background_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("background".to_string()),
                base_dir: None,
            });
        }

        if let Some(logo_url) = &self.logo_url {
            opts.push(CacheMediaOpts {
                remote_url: logo_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("logo".to_string()),
                base_dir: None,
            });
        }

        opts
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

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let platform_metadata = PlatformMetadata {
            background_url: self.background_url.clone(),
            logo_url: self.logo_url.clone(),
            ..Default::default()
        };

        platform_metadata.get_cacheable_media_opts()
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

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let game_metadata = GameMetadata {
            game_id: self.game_id.unwrap_or(0),
            cover_url: self.cover_url.clone(),
            background_url: self.background_url.clone(),
            icon_url: self.icon_url.clone(),
            artwork_urls: self.artwork_urls.clone(),
            screenshot_urls: self.screenshot_urls.clone(),
            ..Default::default()
        };

        game_metadata.get_cacheable_media_opts()
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

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let platform_metadata = PlatformMetadata {
            platform_id: self.platform_id.unwrap_or(0),
            background_url: self.background_url.clone(),
            logo_url: self.logo_url.clone(),
            ..Default::default()
        };

        platform_metadata.get_cacheable_media_opts()
    }
}
