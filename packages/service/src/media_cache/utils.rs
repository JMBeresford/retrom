use std::path::Path;

use sha2::{Digest, Sha256};
use url::Url;

use super::Result;

/// Generate a stable filename for a cached media file based on the original URL
/// Uses SHA256 hash of the URL combined with the original file extension
pub fn generate_cache_filename(url: &str) -> Result<String> {
    // Parse the URL to extract the path and extension
    let parsed_url = Url::parse(url)?;
    let path = parsed_url.path();
    
    // Extract file extension from the URL path
    let extension = Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("bin"); // Default extension if none found

    // Generate SHA256 hash of the full URL
    let mut hasher = Sha256::new();
    hasher.update(url.as_bytes());
    let hash = hasher.finalize();
    let hash_hex = format!("{:x}", hash);

    // Take first 16 characters of hash for shorter filenames
    let short_hash = &hash_hex[..16];

    Ok(format!("{}.{}", short_hash, extension))
}

/// Validate that a URL is safe to cache (basic security checks)
pub fn is_cacheable_url(url: &str) -> bool {
    if let Ok(parsed_url) = Url::parse(url) {
        // Only allow HTTP and HTTPS schemes
        matches!(parsed_url.scheme(), "http" | "https")
    } else {
        false
    }
}

/// Extract the file extension from a URL
pub fn extract_extension_from_url(url: &str) -> Option<String> {
    if let Ok(parsed_url) = Url::parse(url) {
        let path = parsed_url.path();
        Path::new(path)
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_lowercase())
    } else {
        None
    }
}

/// Check if a file extension represents a supported image format
pub fn is_image_extension(extension: &str) -> bool {
    matches!(
        extension.to_lowercase().as_str(),
        "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp" | "tiff" | "ico"
    )
}

/// Check if a file extension represents a supported video format
pub fn is_video_extension(extension: &str) -> bool {
    matches!(
        extension.to_lowercase().as_str(),
        "mp4" | "avi" | "mov" | "mkv" | "webm" | "flv" | "wmv" | "m4v"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_cache_filename() {
        let url = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg";
        let filename = generate_cache_filename(url).unwrap();
        
        // Should be a 16-character hash followed by .jpg
        assert!(filename.ends_with(".jpg"));
        assert_eq!(filename.len(), 20); // 16 chars + ".jpg" = 20 chars
        
        // Same URL should generate same filename
        let filename2 = generate_cache_filename(url).unwrap();
        assert_eq!(filename, filename2);
    }

    #[test]
    fn test_generate_cache_filename_no_extension() {
        let url = "https://example.com/image";
        let filename = generate_cache_filename(url).unwrap();
        
        // Should use "bin" as default extension
        assert!(filename.ends_with(".bin"));
    }

    #[test]
    fn test_is_cacheable_url() {
        assert!(is_cacheable_url("https://example.com/image.jpg"));
        assert!(is_cacheable_url("http://example.com/image.png"));
        assert!(!is_cacheable_url("ftp://example.com/image.jpg"));
        assert!(!is_cacheable_url("file:///local/path/image.jpg"));
        assert!(!is_cacheable_url("not-a-url"));
    }

    #[test]
    fn test_extract_extension_from_url() {
        assert_eq!(
            extract_extension_from_url("https://example.com/image.jpg"),
            Some("jpg".to_string())
        );
        assert_eq!(
            extract_extension_from_url("https://example.com/image.PNG"),
            Some("png".to_string())
        );
        assert_eq!(
            extract_extension_from_url("https://example.com/path/without/extension"),
            None
        );
    }

    #[test]
    fn test_is_image_extension() {
        assert!(is_image_extension("jpg"));
        assert!(is_image_extension("PNG"));
        assert!(is_image_extension("webp"));
        assert!(!is_image_extension("mp4"));
        assert!(!is_image_extension("txt"));
    }

    #[test]
    fn test_is_video_extension() {
        assert!(is_video_extension("mp4"));
        assert!(is_video_extension("AVI"));
        assert!(is_video_extension("webm"));
        assert!(!is_video_extension("jpg"));
        assert!(!is_video_extension("txt"));
    }
}