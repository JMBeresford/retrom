use serde::de::DeserializeOwned;
use std::net::SocketAddr;
use tauri::{plugin::PluginApi, AppHandle, Manager, Runtime};
use tokio::sync::RwLock;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Standalone<R>> {
    Ok(Standalone {
        _app: app.clone(),
        server_handle: RwLock::new(None),
        addr: RwLock::new(None),
    })
}

/// Access to the standalone APIs.
pub struct Standalone<R: Runtime> {
    _app: AppHandle<R>,
    server_handle: RwLock<Option<tokio::task::JoinHandle<std::io::Result<()>>>>,
    addr: RwLock<Option<SocketAddr>>,
}

impl<R: Runtime> Standalone<R> {
    #[tracing::instrument(skip_all)]
    pub async fn start_server(&self) -> crate::Result<()> {
        let server_config_path = self
            ._app
            .path()
            .app_config_dir()?
            .join("server-config.json");

        if self.is_server_running().await {
            return Err(crate::Error::AlreadyRunning);
        }

        std::env::set_var("RETROM_CONFIG", server_config_path);
        let params = self.prepare_db_dir_params().await?;
        let (handle, addr) = retrom_service::get_server(Some(&params)).await;

        self.addr.write().await.replace(addr);
        self.server_handle.write().await.replace(handle);

        tracing::info!("Started standalone server at: {addr}");

        Ok(())
    }

    #[tracing::instrument(skip_all)]
    pub async fn stop_server(&self) -> crate::Result<()> {
        if let Some(handle) = self.server_handle.write().await.take() {
            handle.abort();
            let _ = handle.await;
        }

        self.addr.write().await.take();

        tracing::info!("Stopped standalone server");

        Ok(())
    }

    #[tracing::instrument(skip_all)]
    pub async fn is_server_running(&self) -> bool {
        self.server_handle.read().await.is_some()
    }

    #[tracing::instrument(skip_all)]
    pub async fn get_server_addr(&self) -> Option<SocketAddr> {
        *self.addr.read().await
    }

    async fn prepare_db_dir_params(&self) -> crate::Result<String> {
        let db_dir = self._app.path().app_data_dir()?.join("db");
        let data_dir = db_dir.join("data");
        let pass_file = db_dir.join(".passwd");

        if !data_dir.exists() {
            tokio::fs::create_dir_all(&data_dir).await?;
        }

        Ok(format!(
            "?data_dir={}&password_file={}",
            data_dir.to_str().expect("Data dir path is malformed"),
            pass_file.to_str().expect("Password file path is malformed")
        ))
    }
}
