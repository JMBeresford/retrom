use std::path::PathBuf;

use directories::ProjectDirs;

const QUALIFIER: &str = "com";
const ORGANIZATION: &str = "retrom";
const APPLICATION: &str = "server";

pub struct RetromDirs {
    data_dir: PathBuf,
    config_dir: PathBuf,
    public_dir: PathBuf,
    web_dir: PathBuf,
}

impl RetromDirs {
    pub fn new() -> Self {
        let project_dirs = ProjectDirs::from(QUALIFIER, ORGANIZATION, APPLICATION).unwrap();

        let default_data_dir = project_dirs.data_dir().to_path_buf();
        let default_config_dir = project_dirs.config_dir().to_path_buf();
        let default_web_dir = project_dirs.data_local_dir().join("web").to_path_buf();

        let env_data_dir = std::env::var("RETROM_DATA_DIR").ok();
        let env_config_dir = std::env::var("RETROM_CONFIG_DIR").ok();
        let env_web_dir = std::env::var("RETROM_WEB_DIR").ok();

        let data_dir = env_data_dir
            .map(PathBuf::from)
            .unwrap_or(default_data_dir.clone());

        let config_dir = env_config_dir
            .map(PathBuf::from)
            .unwrap_or(default_config_dir);

        let public_dir = data_dir.join("public");

        let web_dir = env_web_dir
            .map(PathBuf::from)
            .unwrap_or_else(|| default_web_dir.clone());

        if !data_dir.exists() {
            if data_dir != default_data_dir {
                tracing::info!(
                    "Migrating data directory from {:?} to {:?}",
                    default_data_dir,
                    data_dir
                );

                if let Err(why) = std::fs::rename(&default_data_dir, &data_dir) {
                    tracing::error!("Failed to migrate data directory: {}", why);
                }
            }

            if let Err(why) = std::fs::create_dir_all(&data_dir) {
                tracing::error!("Failed to create data directory: {}", why);
            }
        }

        if !public_dir.exists() {
            if let Err(why) = std::fs::create_dir_all(&public_dir) {
                tracing::error!("Failed to create public directory: {}", why);
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
            web_dir,
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

    pub fn web_dir(&self) -> &PathBuf {
        &self.web_dir
    }

    pub fn media_dir(&self) -> PathBuf {
        self.public_dir.join("media")
    }
}

impl Default for RetromDirs {
    fn default() -> Self {
        Self::new()
    }
}
