use super::{CacheMediaOpts, MediaCacheError, Result};
use std::path::PathBuf;

pub mod game_metadata;
pub mod platform_metadata;

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
                tracing::debug!("Cleaning up cache directory: {:?}", cache_dir);
                tokio::fs::remove_dir_all(&cache_dir).await?;
            }

            Ok(())
        }
    }
}
