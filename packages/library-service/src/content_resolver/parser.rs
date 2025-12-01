use retrom_codegen::retrom::{CustomLibraryDefinition, StorageType};

#[derive(Debug, thiserror::Error)]
pub enum ParserError {
    #[error("Required macro missing: {0}")]
    RequiredMacroMissing(String),

    #[error("Duplicate macro: {0}")]
    DuplicateMacro(String),

    #[error("Invalid library definition: {0}")]
    InvalidDefinition(String),
}

type Result<T> = std::result::Result<T, ParserError>;

pub enum ContentMacro {
    Library,
    Platform,
    GameDir,
    GameFile,
    Custom(String),
}

impl TryFrom<String> for ContentMacro {
    type Error = ();
    fn try_from(s: String) -> std::result::Result<Self, Self::Error> {
        let content_macro = match s.as_str() {
            "{library}" => ContentMacro::Library,
            "{platform}" => ContentMacro::Platform,
            "{gameDir}" => ContentMacro::GameDir,
            "{gameFile}" => ContentMacro::GameFile,
            _ => {
                if s.starts_with("{") && s.ends_with("}") {
                    ContentMacro::Custom(s.replace("{", "").replace("}", ""))
                } else {
                    return Err(());
                }
            }
        };

        Ok(content_macro)
    }
}

impl std::fmt::Display for ContentMacro {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            ContentMacro::Library => "{library}".to_string(),
            ContentMacro::Platform => "{platform}".to_string(),
            ContentMacro::GameDir => "{gameDir}".to_string(),
            ContentMacro::GameFile => "{gameFile}".to_string(),
            ContentMacro::Custom(s) => ["{".to_string(), s.clone(), "}".to_string()]
                .into_iter()
                .collect(),
        };

        write!(f, "{s}")
    }
}

impl PartialEq<&str> for ContentMacro {
    fn eq(&self, other: &&str) -> bool {
        let self_string: String = self.to_string();
        self_string.as_str() == *other
    }
}

pub struct LibraryDefinitionParser {
    library_definition: CustomLibraryDefinition,
}

impl LibraryDefinitionParser {
    pub fn new(definition: &CustomLibraryDefinition) -> Result<Self> {
        let parser = LibraryDefinitionParser {
            library_definition: definition.clone(),
        };

        parser.validate_definition()?;

        Ok(parser)
    }

    pub fn depth_to_platforms(&self) -> Result<usize> {
        match self
            .library_definition
            .definition
            .split("/")
            .position(|part| *part == ContentMacro::Platform.to_string())
        {
            Some(depth) => Ok(depth),
            None => Err(ParserError::RequiredMacroMissing(
                ContentMacro::Platform.to_string(),
            )),
        }
    }

    pub fn depth_to_game_dirs(&self) -> Option<usize> {
        self.library_definition
            .definition
            .split("/")
            .position(|part| *part == ContentMacro::GameDir.to_string())
    }

    pub fn depth_to_game_files(&self) -> Option<usize> {
        self.library_definition
            .definition
            .split("/")
            .position(|part| *part == ContentMacro::GameFile.to_string())
    }

    pub fn depth_to_games(&self) -> Result<usize> {
        match self
            .depth_to_game_dirs()
            .or_else(|| self.depth_to_game_files())
        {
            Some(depth) => Ok(depth),
            None => Err(ParserError::RequiredMacroMissing(
                "Either {gameDir} or {gameFile} must be present".to_string(),
            )),
        }
    }

    pub fn game_storage_type(&self) -> StorageType {
        if self.depth_to_game_files().is_some() {
            StorageType::SingleFileGame
        } else {
            StorageType::MultiFileGame
        }
    }

    fn validate_definition(&self) -> Result<()> {
        let def = &self.library_definition.definition;

        if !def.contains(ContentMacro::Library.to_string().as_str())
            && !def.contains(ContentMacro::Platform.to_string().as_str())
        {
            return Err(ParserError::RequiredMacroMissing(
                "Either {library} or {platform} must be present".to_string(),
            ));
        }

        if !def.contains(ContentMacro::Platform.to_string().as_str()) {
            return Err(ParserError::RequiredMacroMissing(
                ContentMacro::Platform.to_string(),
            ));
        }

        if !def.contains(ContentMacro::GameDir.to_string().as_str())
            && !def.contains(ContentMacro::GameFile.to_string().as_str())
        {
            return Err(ParserError::RequiredMacroMissing(
                "Either {gameDir} or {gameFile} must be present".to_string(),
            ));
        }

        let singular_macros = vec![
            ContentMacro::Library,
            ContentMacro::Platform,
            ContentMacro::GameDir,
            ContentMacro::GameFile,
        ];

        for singular_macro in singular_macros {
            if def
                .split("/")
                .filter(|part| part == &singular_macro.to_string().as_str())
                .count()
                > 1
            {
                return Err(ParserError::DuplicateMacro(singular_macro.to_string()));
            }
        }

        if def.contains(ContentMacro::GameDir.to_string().as_str())
            && def.contains(ContentMacro::GameFile.to_string().as_str())
        {
            return Err(ParserError::InvalidDefinition(
                "The definition cannot contain both {gameDir} and {gameFile}".to_string(),
            ));
        }

        let depth_to_platforms = self.depth_to_platforms()?;
        let depth_to_game_dirs = self.depth_to_game_dirs();
        let depth_to_game_files = self.depth_to_game_files();

        if depth_to_game_dirs.is_some_and(|d| depth_to_platforms > d) {
            return Err(ParserError::InvalidDefinition(
                "{platform} must be before {gameDir}".to_string(),
            ));
        }

        if depth_to_game_files.is_some_and(|d| depth_to_platforms > d) {
            return Err(ParserError::InvalidDefinition(
                "{platform} must be before {gameFile}".to_string(),
            ));
        }

        if !def.contains(ContentMacro::Library.to_string().as_str()) && depth_to_platforms != 0 {
            return Err(ParserError::InvalidDefinition(
                "{platform} must be the beginning of the definition if {library} is not present"
                    .to_string(),
            ));
        }

        Ok(())
    }
}
