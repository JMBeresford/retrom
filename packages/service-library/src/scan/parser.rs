//! Parser for library `structure_definition` templates.
//!
//! A structure definition is a `/`-delimited path template describing how a library's
//! filesystem tree maps to entities. Well-known tokens are `{library}` (the root directory
//! itself), `{platform}`, and `{game}`. Arbitrary custom tokens (e.g. `{region}`) are
//! permitted as intermediate path levels; populating tags from them is left for a follow-up.

#[derive(Debug, thiserror::Error)]
pub enum ParserError {
    #[error("Required token missing: {0}")]
    RequiredTokenMissing(String),

    #[error("Duplicate token: {0}")]
    DuplicateToken(String),

    #[error("Invalid structure definition: {0}")]
    InvalidDefinition(String),

    #[error("Parser error: {0}")]
    Other(String),
}

type Result<T> = std::result::Result<T, ParserError>;

const LIBRARY_TOKEN: &str = "{library}";
const PLATFORM_TOKEN: &str = "{platform}";
const GAME_TOKEN: &str = "{game}";

#[derive(Debug, Clone)]
pub struct StructureParser {
    segments: Vec<String>,
}

impl StructureParser {
    pub fn new(definition: &str) -> Result<Self> {
        let segments = definition
            .split('/')
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect();

        let parser = Self { segments };
        parser.validate()?;

        Ok(parser)
    }

    /// Depth of the `{platform}` token relative to the root directory (depth 0).
    pub fn platform_depth(&self) -> usize {
        self.position(PLATFORM_TOKEN)
            .expect("platform token presence guaranteed by validate()")
    }

    /// Depth of the `{game}` token relative to the root directory (depth 0).
    pub fn game_depth(&self) -> usize {
        self.position(GAME_TOKEN)
            .expect("game token presence guaranteed by validate()")
    }

    /// Depth of the `{game}` token relative to a `{platform}` directory.
    pub fn game_depth_from_platform(&self) -> usize {
        self.game_depth() - self.platform_depth()
    }

    fn position(&self, token: &str) -> Option<usize> {
        self.segments.iter().position(|s| s == token)
    }

    fn count(&self, token: &str) -> usize {
        self.segments.iter().filter(|s| *s == token).count()
    }

    fn validate(&self) -> Result<()> {
        let platform_depth = self
            .position(PLATFORM_TOKEN)
            .ok_or_else(|| ParserError::RequiredTokenMissing(PLATFORM_TOKEN.to_string()))?;

        let game_depth = self
            .position(GAME_TOKEN)
            .ok_or_else(|| ParserError::RequiredTokenMissing(GAME_TOKEN.to_string()))?;

        for token in [LIBRARY_TOKEN, PLATFORM_TOKEN, GAME_TOKEN] {
            if self.count(token) > 1 {
                return Err(ParserError::DuplicateToken(token.to_string()));
            }
        }

        if platform_depth >= game_depth {
            return Err(ParserError::InvalidDefinition(
                "{platform} must come before {game}".to_string(),
            ));
        }

        if self.position(LIBRARY_TOKEN).is_none() && platform_depth != 0 {
            return Err(ParserError::InvalidDefinition(
                "{platform} must be the first token when {library} is absent".to_string(),
            ));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_standard_definition() {
        let parser = StructureParser::new("{library}/{platform}/{game}").unwrap();
        assert_eq!(parser.platform_depth(), 1);
        assert_eq!(parser.game_depth(), 2);
        assert_eq!(parser.game_depth_from_platform(), 1);
    }

    #[test]
    fn parses_definition_without_library() {
        let parser = StructureParser::new("{platform}/{game}").unwrap();
        assert_eq!(parser.platform_depth(), 0);
        assert_eq!(parser.game_depth(), 1);
    }

    #[test]
    fn allows_custom_intermediate_tokens() {
        let parser = StructureParser::new("{library}/{platform}/{region}/{game}").unwrap();
        assert_eq!(parser.platform_depth(), 1);
        assert_eq!(parser.game_depth(), 3);
        assert_eq!(parser.game_depth_from_platform(), 2);
    }

    #[test]
    fn rejects_missing_platform() {
        assert!(StructureParser::new("{library}/{game}").is_err());
    }

    #[test]
    fn rejects_missing_game() {
        assert!(StructureParser::new("{library}/{platform}").is_err());
    }

    #[test]
    fn rejects_game_before_platform() {
        assert!(StructureParser::new("{game}/{platform}").is_err());
    }

    #[test]
    fn rejects_duplicate_token() {
        assert!(StructureParser::new("{platform}/{platform}/{game}").is_err());
    }

    #[test]
    fn rejects_platform_not_first_without_library() {
        assert!(StructureParser::new("{region}/{platform}/{game}").is_err());
    }
}
