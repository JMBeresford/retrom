use crate::media_cache::{cacheable_media::CacheableMetadata, CacheMediaOpts};
use retrom_codegen::retrom::services::metadata::v1::GameMetadata;
use retrom_service_config::retrom_dirs::RetromDirs;
use std::path::PathBuf;

impl CacheableMetadata for GameMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        RetromDirs::new()
            .media_dir()
            .join("games")
            .join(&self.game_id)
            .into()
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
