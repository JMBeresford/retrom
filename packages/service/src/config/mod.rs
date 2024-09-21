use config::{Config, ConfigError, File};
use retrom_codegen::retrom::StorageType;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ConnectionConfig {
    pub port: i32,
    pub db_url: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ContentDirectory {
    pub path: String,
    pub storage_type: StorageType,
}

#[derive(Debug, Deserialize, Clone)]
pub struct IGDBConfig {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Deserialize)]
pub struct ServerConfig {
    pub connection: ConnectionConfig,
    pub content_directories: Vec<ContentDirectory>,
    pub igdb: IGDBConfig,
}

impl ServerConfig {
    pub fn new() -> Result<Self, ConfigError> {
        dotenvy::dotenv().ok();

        let mut default_config =
            Config::builder().add_source(File::with_name("default_config.json"));

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

        let config_file = std::env::var("RETROM_CONFIG").unwrap_or_else(|_| {
            tracing::info!("No config file specified, using default config.");

            "".into()
        });

        let s = default_config
            .add_source(File::with_name(&config_file).required(false))
            .build()?;

        s.try_deserialize()
    }
}
