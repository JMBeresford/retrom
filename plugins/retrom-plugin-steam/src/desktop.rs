use retrom_codegen::retrom::InstallationStatus;
use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};
use tauri_plugin_shell::ShellExt;
use tracing::instrument;

#[instrument(skip_all)]
pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<Steam<R>> {
    let steam_dir = steamlocate::SteamDir::locate()?;

    Ok(Steam {
        app_handle: app.clone(),
        steam_dir,
    })
}

/// Access to the steamworks APIs.
pub struct Steam<R: Runtime> {
    app_handle: AppHandle<R>,
    steam_dir: steamlocate::SteamDir,
}

impl<R: Runtime> Steam<R> {
    #[instrument(skip(self))]
    pub async fn get_installation_status(&self, app_id: u32) -> crate::Result<InstallationStatus> {
        let maybe_app = self.steam_dir.find_app(app_id)?;

        match maybe_app.is_some() {
            true => Ok(InstallationStatus::Installed),
            false => Ok(InstallationStatus::NotInstalled),
        }
    }

    pub async fn install_game(&self, app_id: u32) -> crate::Result<()> {
        let shell = self.app_handle.shell();
        shell.open(format!("steam://install/{app_id}"), None)?;

        Ok(())
    }

    pub async fn uninstall_game(&self, app_id: u32) -> crate::Result<()> {
        let shell = self.app_handle.shell();
        shell.open(format!("steam://uninstall/{app_id}"), None)?;

        Ok(())
    }

    pub async fn launch_game(&self, app_id: u32) -> crate::Result<()> {
        let shell = self.app_handle.shell();
        shell.open(format!("steam://rungameid/{app_id}"), None)?;

        Ok(())
    }
}
