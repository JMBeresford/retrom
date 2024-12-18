use config::{Config, ConfigError, File};
use retrom_codegen::retrom::{ConnectionConfig, ContentDirectory, ServerConfig, StorageType};
use std::path::PathBuf;
use tokio::sync::RwLock;

#[derive(thiserror::Error, Debug)]
pub enum RetromConfigError {
    #[error("Error parsing config: {0}")]
    ParseError(#[from] ConfigError),
    #[error("Config path not provided: {0}")]
    ConfigNotProvided(#[from] std::env::VarError),
    #[error("Config file error: {0}")]
    ConfigFileError(#[from] tokio::io::Error),
    #[error("Could not (de)serialize config: {0}")]
    ConfigSerializationError(#[from] serde_json::Error),
}

pub type Result<T> = std::result::Result<T, RetromConfigError>;

pub struct ServerConfigManager {
    config: RwLock<ServerConfig>,
    config_path: PathBuf,
}

impl ServerConfigManager {
    pub fn new() -> Result<Self> {
        dotenvy::dotenv().ok();
        let config_path = std::env::var("RETROM_CONFIG")?.into();
        let config = RwLock::new(Self::read_config_file()?);

        Ok(Self {
            config,
            config_path,
        })
    }

    pub async fn get_config(&self) -> ServerConfig {
        self.config.read().await.clone()
    }

    pub async fn update_config(&self, config: ServerConfig) -> Result<()> {
        let data = serde_json::to_vec_pretty(&config)?;
        tokio::fs::write(&self.config_path, data).await?;
        *self.config.write().await = config;

        Ok(())
    }

    fn read_config_file() -> Result<ServerConfig> {
        dotenvy::dotenv().ok();

        let default_config = ServerConfig {
            connection: Some(ConnectionConfig {
                port: 5101,
                db_url: "postgres://postgres:postgres@localhost:5432/retrom".into(),
            }),
            content_directories: vec![ContentDirectory {
                path: "/app/library".into(),
                storage_type: Some(i32::from(StorageType::MultiFileGame)),
            }],
            ..Default::default()
        };

        if std::env::var("RETROM_PORT").is_ok() {
            tracing::error!("RETROM_PORT env var is deprecated, use a config file instead.");
        }

        if std::env::var("DATABASE_URL").is_ok() {
            tracing::error!("DATABASE_URL env var is deprecated, use a config file instead.");
        }

        if std::env::var("IGDB_CLIENT_ID").is_ok() {
            tracing::error!("IGDB_CLIENT_ID env var is deprecated, use a config file instead.");
        }

        if std::env::var("IGDB_CLIENT_SECRET").is_ok() {
            tracing::error!("IGDB_CLIENT_SECRET env var is deprecated, use a config file instead.");
        }

        let config_file = std::env::var("RETROM_CONFIG").ok();

        let config = config_file.map(|config_file| {
            Config::builder().add_source(File::with_name(&config_file).required(false))
        });

        let mut s: ServerConfig = match config {
            Some(config) => config.build()?.try_deserialize()?,
            None => default_config,
        };

        if let Ok(content_dir) = std::env::var("CONTENT_DIR") {
            tracing::warn!("CONTENT_DIR env var is deprecated, use a config file instead.");
            s.content_directories.push(ContentDirectory {
                path: content_dir,
                storage_type: Some(i32::from(StorageType::MultiFileGame)),
            });
        }

        Ok(s)
    }
}
