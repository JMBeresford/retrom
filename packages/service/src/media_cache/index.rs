//! Index management for media cache directories.
//!
//! This module provides sidecar index file functionality for tracking metadata assets
//! and their origins. Each cache directory can have an `index.json` file that contains
//! information about all cached files including their remote URLs and update timestamps.
//!
//! # Example index structure
//!
//! ```json
//! {
//!   "version": 1,
//!   "entries": {
//!     "cover.jpg": {
//!       "remote_url": "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg",
//!       "updated_at": {
//!         "seconds": 1672531200,
//!         "nanos": 0
//!       }
//!     },
//!     "artwork/artwork1.jpg": {
//!       "remote_url": "https://example.com/artwork1.jpg",
//!       "updated_at": {
//!         "seconds": 1672531200,
//!         "nanos": 0
//!       }
//!     }
//!   }
//! }
//! ```
//!
//! # Directory structure
//!
//! - Games: `/media/games/{game_id}/index.json`
//! - Platforms: `/media/platforms/{platform_id}/index.json`

use retrom_codegen::timestamp::Timestamp;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use tokio::fs;
use tracing::{debug, warn};

use super::{MediaCacheError, Result};

/// Index entry for a single media file
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct IndexEntry {
    /// The original remote URL this file was cached from, if available
    pub remote_url: Option<String>,
    /// When this file was last updated/cached
    pub updated_at: Timestamp,
}

/// Index of all media files in a cache directory with versioning support
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct MetadataIndex {
    pub version: i32,
    pub entries: HashMap<String, IndexEntry>,
}

/// Manages sidecar index files for media cache directories
pub struct IndexManager {
    index_filename: String,
}

impl Default for IndexManager {
    fn default() -> Self {
        Self::new()
    }
}

impl IndexManager {
    /// Create a new index manager with default settings
    pub fn new() -> Self {
        Self {
            index_filename: "index.json".to_string(),
        }
    }

    /// Get the path to the index file for a given cache directory
    pub fn get_index_path(&self, cache_dir: &Path) -> PathBuf {
        cache_dir.join(&self.index_filename)
    }

    /// Read the index file from a cache directory
    /// Returns an empty index if the file doesn't exist
    pub async fn read_index(&self, cache_dir: &Path) -> Result<MetadataIndex> {
        let index_path = self.get_index_path(cache_dir);

        if !index_path.exists() {
            debug!(
                "Index file not found, returning empty index: {:?}",
                index_path
            );
            return Ok(MetadataIndex {
                version: 1,
                entries: HashMap::new(),
            });
        }

        debug!("Reading index file: {:?}", index_path);
        let content = fs::read_to_string(&index_path).await?;

        match serde_json::from_str::<MetadataIndex>(&content) {
            Ok(index) => Ok(index),
            Err(e) => {
                warn!("Failed to parse index file {:?}: {}", index_path, e);
                // Return empty index if parsing fails, don't fail the operation
                Ok(MetadataIndex {
                    version: 1,
                    entries: HashMap::new(),
                })
            }
        }
    }

    /// Write the index file to a cache directory
    /// Uses atomic write (write to temp file, then rename)
    pub async fn write_index(&self, cache_dir: &Path, index: &MetadataIndex) -> Result<()> {
        if !cache_dir.exists() {
            fs::create_dir_all(cache_dir).await?;
        }

        let index_path = self.get_index_path(cache_dir);
        let temp_path = index_path.with_extension("tmp");

        debug!("Writing index file: {:?}", index_path);

        let content = serde_json::to_string_pretty(index).map_err(|e| {
            MediaCacheError::Io(std::io::Error::other(format!(
                "JSON serialization failed: {}",
                e
            )))
        })?;

        // Write to temp file first
        fs::write(&temp_path, content).await?;

        // Atomic rename
        fs::rename(temp_path, index_path).await?;

        Ok(())
    }

    /// Add or update an index entry for a cached file
    pub async fn update_entry(
        &self,
        cache_dir: &Path,
        relative_path: &str,
        remote_url: Option<&str>,
    ) -> Result<()> {
        let mut index = self.read_index(cache_dir).await?;

        let entry = IndexEntry {
            remote_url: remote_url.map(|s| s.to_string()),
            updated_at: SystemTime::now().into(),
        };

        debug!("Updating index entry: {} -> {:?}", relative_path, entry);
        index.entries.insert(relative_path.to_string(), entry);

        self.write_index(cache_dir, &index).await
    }

    /// Remove an index entry for a file
    pub async fn remove_entry(&self, cache_dir: &Path, relative_path: &str) -> Result<()> {
        let mut index = self.read_index(cache_dir).await?;

        if index.entries.remove(relative_path).is_some() {
            debug!("Removing index entry: {}", relative_path);
            self.write_index(cache_dir, &index).await?;
        }

        Ok(())
    }

    /// Remove the index file completely (used during cache cleanup)
    pub async fn remove_index(&self, cache_dir: &Path) -> Result<()> {
        let index_path = self.get_index_path(cache_dir);

        if index_path.exists() {
            debug!("Removing index file: {:?}", index_path);
            fs::remove_file(index_path).await?;
        }

        Ok(())
    }

    /// Get a relative path from the cache directory to a file
    pub fn get_relative_path(&self, cache_dir: &Path, file_path: &Path) -> Result<String> {
        let relative = file_path.strip_prefix(cache_dir).map_err(|_| {
            MediaCacheError::Io(std::io::Error::other(format!(
                "File path {:?} is not within cache directory {:?}",
                file_path, cache_dir
            )))
        })?;

        // Use forward slashes for consistency across platforms
        Ok(relative.to_string_lossy().replace('\\', "/"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_index_creation_and_reading() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        // Reading non-existent index should return empty map
        let index = manager.read_index(cache_dir).await.unwrap();
        assert!(index.entries.is_empty());
        assert_eq!(index.version, 1);

        // Create and write an index
        let mut entries = HashMap::new();
        entries.insert(
            "cover.jpg".to_string(),
            IndexEntry {
                remote_url: Some("https://example.com/cover.jpg".to_string()),
                updated_at: SystemTime::now().into(),
            },
        );

        let test_index = MetadataIndex {
            version: 1,
            entries,
        };

        manager.write_index(cache_dir, &test_index).await.unwrap();

        // Read it back
        let read_index = manager.read_index(cache_dir).await.unwrap();
        assert_eq!(read_index.entries.len(), 1);
        assert!(read_index.entries.contains_key("cover.jpg"));
        assert_eq!(read_index.version, 1);

        let entry = &read_index.entries["cover.jpg"];
        assert_eq!(
            entry.remote_url,
            Some("https://example.com/cover.jpg".to_string())
        );
    }

    #[tokio::test]
    async fn test_update_entry() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        // Update entry in empty index
        manager
            .update_entry(
                cache_dir,
                "cover.jpg",
                Some("https://example.com/cover.jpg"),
            )
            .await
            .unwrap();

        let index = manager.read_index(cache_dir).await.unwrap();
        assert_eq!(index.entries.len(), 1);
        assert!(index.entries.contains_key("cover.jpg"));

        // Update the same entry
        manager
            .update_entry(
                cache_dir,
                "cover.jpg",
                Some("https://example.com/new-cover.jpg"),
            )
            .await
            .unwrap();

        let updated_index = manager.read_index(cache_dir).await.unwrap();
        assert_eq!(updated_index.entries.len(), 1);
        let entry = &updated_index.entries["cover.jpg"];
        assert_eq!(
            entry.remote_url,
            Some("https://example.com/new-cover.jpg".to_string())
        );
    }

    #[tokio::test]
    async fn test_remove_entry() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        // Add an entry
        manager
            .update_entry(
                cache_dir,
                "cover.jpg",
                Some("https://example.com/cover.jpg"),
            )
            .await
            .unwrap();

        // Remove it
        manager.remove_entry(cache_dir, "cover.jpg").await.unwrap();

        let index = manager.read_index(cache_dir).await.unwrap();
        assert!(index.entries.is_empty());
    }

    #[tokio::test]
    async fn test_get_relative_path() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        let file_path = cache_dir.join("artwork").join("image.jpg");
        let relative = manager.get_relative_path(cache_dir, &file_path).unwrap();

        // Should use forward slashes regardless of platform
        assert_eq!(relative, "artwork/image.jpg");
    }

    #[tokio::test]
    async fn test_index_persistence() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        // Add multiple entries
        manager
            .update_entry(
                cache_dir,
                "cover.jpg",
                Some("https://example.com/cover.jpg"),
            )
            .await
            .unwrap();
        manager
            .update_entry(
                cache_dir,
                "background.png",
                Some("https://example.com/bg.png"),
            )
            .await
            .unwrap();
        manager
            .update_entry(
                cache_dir,
                "artwork/art1.jpg",
                Some("https://example.com/art1.jpg"),
            )
            .await
            .unwrap();

        // Verify persistence by creating a new manager instance
        let new_manager = IndexManager::new();
        let index = new_manager.read_index(cache_dir).await.unwrap();

        assert_eq!(index.entries.len(), 3);
        assert!(index.entries.contains_key("cover.jpg"));
        assert!(index.entries.contains_key("background.png"));
        assert!(index.entries.contains_key("artwork/art1.jpg"));
    }

    #[tokio::test]
    async fn test_malformed_index_handling() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        // Write invalid JSON to index file
        let index_path = manager.get_index_path(cache_dir);
        fs::create_dir_all(cache_dir).await.unwrap();
        fs::write(index_path, "invalid json content").await.unwrap();

        // Should return empty index instead of failing
        let index = manager.read_index(cache_dir).await.unwrap();
        assert!(index.entries.is_empty());
    }

    #[tokio::test]
    async fn test_timestamp_handling() {
        let temp_dir = TempDir::new().unwrap();
        let cache_dir = temp_dir.path();
        let manager = IndexManager::new();

        // Add an entry and check that timestamp is recent
        let before = SystemTime::now();
        manager
            .update_entry(cache_dir, "test.jpg", Some("https://example.com/test.jpg"))
            .await
            .unwrap();
        let after = SystemTime::now();

        let index = manager.read_index(cache_dir).await.unwrap();
        let entry = &index.entries["test.jpg"];

        // Verify the timestamp is roughly within the expected range (seconds precision)
        let before_timestamp: Timestamp = before.into();
        let after_timestamp: Timestamp = after.into();

        assert!(entry.updated_at.seconds >= before_timestamp.seconds);
        assert!(entry.updated_at.seconds <= after_timestamp.seconds + 1); // Allow 1 second tolerance

        // Test that updating an entry updates the timestamp
        std::thread::sleep(std::time::Duration::from_millis(100));
        manager
            .update_entry(
                cache_dir,
                "test.jpg",
                Some("https://example.com/updated.jpg"),
            )
            .await
            .unwrap();

        let updated_index = manager.read_index(cache_dir).await.unwrap();
        let updated_entry = &updated_index.entries["test.jpg"];

        // Verify the timestamp was updated (should be at least equal, usually greater)
        assert!(updated_entry.updated_at.seconds >= entry.updated_at.seconds);
        assert_eq!(
            updated_entry.remote_url,
            Some("https://example.com/updated.jpg".to_string())
        );
    }
}
