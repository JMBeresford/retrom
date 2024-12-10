use std::path::PathBuf;

use config::{Config, File};
use retrom_codegen::retrom::RetromClientConfig;
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Manager, Runtime};
use tokio::sync::RwLock;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<ConfigManager<R>> {
    ConfigManager::new(app.clone())
}

/// Access to the config APIs.
pub struct ConfigManager<R: Runtime> {
    _app: AppHandle<R>,
    config: RwLock<RetromClientConfig>,
    config_path: PathBuf,
}

impl<R: Runtime> ConfigManager<R> {
    pub fn new(app: AppHandle<R>) -> crate::Result<Self> {
        let config_path = app.path().app_config_dir()?.join("config.json");

        let initial_config = match config_path.exists() {
            false => {
                let default_config = RetromClientConfig::default();
                let data = serde_json::to_vec_pretty(&default_config)?;
                let default_config = RetromClientConfig::default();

                std::fs::write(&config_path, data)?;

                default_config
            }
            true => {
                Self::read_config_file(config_path.to_str().expect("Config path is malformed"))?
            }
        };

        Ok(Self {
            _app: app.clone(),
            config: RwLock::new(initial_config),
            config_path,
        })
    }

    pub async fn get_config(&self) -> RetromClientConfig {
        self.config.read().await.clone()
    }

    pub async fn update_config(&self, new_config: RetromClientConfig) -> crate::Result<()> {
        let data = serde_json::to_vec_pretty(&new_config)?;
        tokio::fs::write(&self.config_path, data).await?;

        *self.config.write().await = new_config;

        Ok(())
    }

    fn read_config_file(path: &str) -> crate::Result<RetromClientConfig> {
        let builder = Config::builder().add_source(File::with_name(path));

        let config = builder.build()?.try_deserialize()?;

        Ok(config)
    }
}
