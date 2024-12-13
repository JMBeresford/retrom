use config::{Config, ConfigError, File};
use retrom_codegen::retrom::{ContentDirectory, ServerConfig, StorageType};
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
        let data = serde_json::to_vec(&config)?;
        tokio::fs::write(&self.config_path, data).await?;
        *self.config.write().await = config;

        Ok(())
    }

    fn read_config_file() -> Result<ServerConfig> {
        dotenvy::dotenv().ok();

        let mut default_connection = config::Map::<String, String>::new();
        default_connection.insert("port".into(), "5101".into());
        default_connection.insert(
            "db_url".into(),
            "postgres://postgres:postgres@localhost:5432/retrom".into(),
        );

        let mut legacy_content_dir = config::Map::<String, String>::new();
        legacy_content_dir.insert("path".into(), "/app/library".into());
        legacy_content_dir.insert("storage_type".into(), "MultiFileGame".into());
        let default_content_directories = config::ValueKind::Array(vec![legacy_content_dir.into()]);

        let mut default_config = Config::builder()
            .set_default("connection", default_connection)?
            .set_default("content_directories", default_content_directories)?
            .set_default("igdb.client_id", "")?
            .set_default("igdb.client_secret", "")?;

        if let Ok(port) = std::env::var("RETROM_PORT") {
            tracing::warn!("RETROM_PORT env var is deprecated, use a config file instead.");
            default_config = default_config.set_override("connection.port", port)?;
        }

        if let Ok(db_url) = std::env::var("DATABASE_URL") {
            tracing::warn!("DATABASE_URL env var is deprecated, use a config file instead.");
            default_config = default_config.set_override("connection.db_url", db_url)?;
        }

        if let Ok(igdb_client_id) = std::env::var("IGDB_CLIENT_ID") {
            tracing::warn!("IGDB_CLIENT_ID env var is deprecated, use a config file instead.");
            default_config = default_config.set_override("igdb.client_id", igdb_client_id)?;
        }

        if let Ok(igdb_client_secret) = std::env::var("IGDB_CLIENT_SECRET") {
            tracing::warn!("IGDB_CLIENT_SECRET env var is deprecated, use a config file instead.");
            default_config =
                default_config.set_override("igdb.client_secret", igdb_client_secret)?;
        }

        let config_file = std::env::var("RETROM_CONFIG").ok();

        let config = config_file.map(|config_file| {
            Config::builder().add_source(File::with_name(&config_file).required(false))
        });

        let mut s: ServerConfig = match config {
            Some(config) => config.build()?.try_deserialize()?,
            None => default_config.build()?.try_deserialize()?,
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
