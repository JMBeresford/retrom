use std::path::Path;

use sha2::{Digest, Sha256};
use url::Url;

use super::Result;

/// Generate a stable filename for a cached media file based on the original URL
/// Uses SHA256 hash of the URL combined with the original file extension
pub fn generate_cache_filename(url: &str, fallback_extension: Option<&str>) -> Result<String> {
    let parsed_url = Url::parse(url)?;
    let path = parsed_url.path();

    let extension = Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or(fallback_extension.unwrap_or("bin"));

    let mut hasher = Sha256::new();
    hasher.update(url.as_bytes());
    let hash = hasher.finalize();
    let hash_hex = format!("{hash:x}");

    let short_hash = &hash_hex[..16];

    Ok(format!("{short_hash}.{extension}"))
}

/// Generate a semantic filename for first-class media types using the semantic name and URL extension
pub fn generate_semantic_filename(
    url: &str,
    semantic_name: &str,
    fallback_extension: Option<&str>,
) -> Result<String> {
    let parsed_url = Url::parse(url)?;
    let path = parsed_url.path();

    let extension = Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or(fallback_extension.unwrap_or("bin"));

    Ok(format!("{semantic_name}.{extension}"))
}

/// Validate that a URL is safe to cache (basic security checks)
pub fn is_cacheable_url(url: &str) -> bool {
    if let Ok(parsed_url) = Url::parse(url) {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_cache_filename() {
        let url = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg";
        let filename = generate_cache_filename(url, None).unwrap();

        // Should be a 16-character hash followed by .jpg
        assert!(filename.ends_with(".jpg"));
        assert_eq!(filename.len(), 20); // 16 chars + ".jpg" = 20 chars

        // Same URL should generate same filename
        let filename2 = generate_cache_filename(url, None).unwrap();
        assert_eq!(filename, filename2);
    }

    #[test]
    fn test_generate_cache_filename_no_extension() {
        let url = "https://example.com/image";
        let filename = generate_cache_filename(url, None).unwrap();

        // Should use "bin" as default extension
        assert!(filename.ends_with(".bin"));
    }

    #[test]
    fn test_generate_semantic_filename() {
        let url = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abcd1234.jpg";
        let filename = generate_semantic_filename(url, "cover", None).unwrap();

        // Should be the semantic name followed by the extension
        assert_eq!(filename, "cover.jpg");

        // Test with different extension
        let url_png = "https://example.com/background.png";
        let filename_png = generate_semantic_filename(url_png, "background", None).unwrap();
        assert_eq!(filename_png, "background.png");

        // Test with no extension
        let url_no_ext = "https://example.com/icon";
        let filename_no_ext = generate_semantic_filename(url_no_ext, "icon", None).unwrap();
        assert_eq!(filename_no_ext, "icon.bin");
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
}
