use std::path::PathBuf;

use directories::ProjectDirs;

const QUALIFIER: &str = "com";
const ORGANIZATION: &str = "retrom";
const APPLICATION: &str = "server";

pub struct RetromDirs {
    data_dir: PathBuf,
    config_dir: PathBuf,
    public_dir: PathBuf,
}

impl RetromDirs {
    pub fn new() -> Self {
        let project_dirs = ProjectDirs::from(QUALIFIER, ORGANIZATION, APPLICATION).unwrap();
        let data_dir = project_dirs.data_dir().to_path_buf();
        let config_dir = project_dirs.config_dir().to_path_buf();
        let public_dir = project_dirs.data_dir().join("public");

        if !public_dir.exists() {
            if let Err(why) = std::fs::create_dir_all(&data_dir) {
                tracing::error!("Failed to create data directory: {}", why);
            }
        }

        if !config_dir.exists() {
            if let Err(why) = std::fs::create_dir_all(&config_dir) {
                tracing::error!("Failed to create config directory: {}", why);
            }
        }

        Self {
            data_dir,
            config_dir,
            public_dir,
        }
    }

    pub fn data_dir(&self) -> &PathBuf {
        &self.data_dir
    }

    pub fn config_dir(&self) -> &PathBuf {
        &self.config_dir
    }

    pub fn public_dir(&self) -> &PathBuf {
        &self.public_dir
    }
}

impl Default for RetromDirs {
    fn default() -> Self {
        Self::new()
    }
}
