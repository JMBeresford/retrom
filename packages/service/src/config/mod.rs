use config::{Config, ConfigError, File};
use retrom_codegen::retrom::StorageType;
use serde::{Deserialize, Serialize};

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

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SteamConfig {
    pub api_key: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ServerConfig {
    pub connection: ConnectionConfig,
    pub content_directories: Vec<ContentDirectory>,
    pub igdb: IGDBConfig,
    pub steam: Option<SteamConfig>,
}

impl ServerConfig {
    pub fn new() -> Result<Self, ConfigError> {
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

        let mut s: Self = match config {
            Some(config) => config.build()?.try_deserialize()?,
            None => default_config.build()?.try_deserialize()?,
        };

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
