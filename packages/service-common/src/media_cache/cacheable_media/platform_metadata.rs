use crate::{
    media_cache::{cacheable_media::CacheableMetadata, CacheMediaOpts},
    retrom_dirs::RetromDirs,
};
use retrom_codegen::retrom::services::metadata::v1::PlatformMetadata;
use std::path::PathBuf;

impl CacheableMetadata for PlatformMetadata {
    fn get_cache_dir(&self) -> Option<PathBuf> {
        if self.platform.trim().is_empty() {
            return None;
        }

        Some(
            RetromDirs::new()
                .media_dir()
                .join("platform_metadata")
                .join(&self.platform),
        )
    }

    fn get_cacheable_media_opts(&self) -> Vec<CacheMediaOpts> {
        let mut opts = Vec::new();

        let cache_dir = match self.get_cache_dir() {
            Some(dir) => dir,
            None => {
                tracing::warn!("No cache directory available for PlatformMetadata");
                return opts;
            }
        };

        if let Some(background_url) = &self.background_url {
            opts.push(CacheMediaOpts {
                remote_url: background_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("background".to_string()),
                base_dir: None,
                optimize: true,
            });
        }

        if let Some(logo_url) = &self.logo_url {
            opts.push(CacheMediaOpts {
                remote_url: logo_url.clone(),
                cache_dir: cache_dir.clone(),
                semantic_name: Some("logo".to_string()),
                base_dir: None,
                optimize: true,
            });
        }

        opts
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn platform_cache_dir_is_none_for_empty_platform_id() {
        let metadata = PlatformMetadata {
            platform: "".to_string(),
            ..Default::default()
        };

        assert!(metadata.get_cache_dir().is_none());
    }
}
