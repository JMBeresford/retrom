use crate::media_cache::{cacheable_media::CacheableMetadata, CacheMediaOpts};
use retrom_codegen::retrom::services::metadata::v1::{
    GameMetadata, GameMetadataArtwork, GameMetadataScreenshot, GameMetadataVideo,
};
use retrom_service_config::retrom_dirs::RetromDirs;
use std::path::PathBuf;

impl CacheableMetadata for GameMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        if self.id.trim().is_empty() {
            return None;
        }

        Some(
            RetromDirs::new()
                .media_dir()
                .join("game_metadata")
                .join(&self.id),
        )
    }

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                tracing::warn!("No cache directory available for GameMetadata");
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

        opts
    }
}

impl CacheableMetadata for GameMetadataArtwork {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        if self.game_metadata_id.trim().is_empty() {
            return None;
        }

        Some(
            RetromDirs::new()
                .media_dir()
                .join("game_metadata")
                .join(&self.game_metadata_id),
        )
    }

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                tracing::warn!("No cache directory available for ArtworkMetadata");
                return opts;
            }
        };

        opts.push(CacheMediaOpts {
            remote_url: self.url.clone(),
            cache_dir,
            semantic_name: None,
            base_dir: Some(PathBuf::from("artwork")),
        });

        opts
    }
}

impl CacheableMetadata for GameMetadataScreenshot {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        if self.game_metadata_id.trim().is_empty() {
            return None;
        }

        Some(
            RetromDirs::new()
                .media_dir()
                .join("game_metadata")
                .join(&self.game_metadata_id),
        )
    }

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                tracing::warn!("No cache directory available for ScreenshotMetadata");
                return opts;
            }
        };

        opts.push(CacheMediaOpts {
            remote_url: self.url.clone(),
            cache_dir,
            semantic_name: None,
            base_dir: Some(PathBuf::from("screenshots")),
        });

        opts
    }
}

impl CacheableMetadata for GameMetadataVideo {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        if self.game_metadata_id.trim().is_empty() {
            return None;
        }

        Some(
            RetromDirs::new()
                .media_dir()
                .join("game_metadata")
                .join(&self.game_metadata_id),
        )
    }

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                tracing::warn!("No cache directory available for VideoMetadata");
                return opts;
            }
        };

        opts.push(CacheMediaOpts {
            remote_url: self.url.clone(),
            cache_dir,
            semantic_name: None,
            base_dir: Some(PathBuf::from("videos")),
        });

        opts
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn game_metadata_cache_dir_is_none_for_empty_id() {
        let metadata = GameMetadata {
            id: "".to_string(),
            ..Default::default()
        };

        assert!(metadata.get_cache_dir().is_none());
    }

    #[test]
    fn artwork_cache_dir_is_none_for_empty_game_metadata_id() {
        let metadata = GameMetadataArtwork {
            game_metadata_id: "".to_string(),
            ..Default::default()
        };

        assert!(metadata.get_cache_dir().is_none());
    }

    #[test]
    fn screenshot_cache_dir_is_none_for_empty_game_metadata_id() {
        let metadata = GameMetadataScreenshot {
            game_metadata_id: "".to_string(),
            ..Default::default()
        };

        assert!(metadata.get_cache_dir().is_none());
    }

    #[test]
    fn video_cache_dir_is_none_for_empty_game_metadata_id() {
        let metadata = GameMetadataVideo {
            game_metadata_id: "".to_string(),
            ..Default::default()
        };

        assert!(metadata.get_cache_dir().is_none());
    }
}
