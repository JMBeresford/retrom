use config::{Config, ConfigError, File};
use retrom_codegen::retrom::StorageType;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub struct ConnectionConfig {
    pub port: i32,
    pub db_url: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ContentDirectory {
    pub path: String,
    pub storage_type: StorageType,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct IGDBConfig {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ServerConfig {
    pub connection: ConnectionConfig,
    pub content_directories: Vec<ContentDirectory>,
    pub igdb: IGDBConfig,
}

impl ServerConfig {
    pub fn new() -> Result<Self, ConfigError> {
        dotenvy::dotenv().ok();

        let config_file = std::env::var("RETROM_CONFIG").unwrap_or_else(|_| {
            tracing::info!("No config file specified, using default config.");

            "".into()
        });

        let config = Config::builder().add_source(File::with_name(&config_file).required(false));

        let mut default_config = Config::builder()
            .set_default("connection.port", "5101")?
            .set_default(
                "connection.db_url",
                "postgres://postgres:postgres@localhost:5432/retrom",
            )?
            .set_default("content_directories", config::ValueKind::Array(vec![]))?
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

        let mut s: Self = config
            .build()
            .unwrap_or(default_config.build()?)
            .try_deserialize()?;

        if let Ok(content_dir) = std::env::var("CONTENT_DIR") {
            tracing::warn!("CONTENT_DIR env var is deprecated, use a config file instead.");
            s.content_directories.push(ContentDirectory {
                path: content_dir,
                storage_type: StorageType::MultiFileGame,
            });
        }

        Ok(s)
    }
}
