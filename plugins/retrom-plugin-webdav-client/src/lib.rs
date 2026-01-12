use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[cfg(desktop)]
mod desktop;

mod commands;
mod error;

pub use error::{Error, Result};

#[cfg(desktop)]
pub use desktop::{
    CopyOptions, DeleteOptions, LockOptions, MkcolOptions, PropFindOptions, PropPatchOptions,
    PutOptions, UnlockOptions, WebDAVClient,
};

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the webdav-client APIs.
pub trait WebdavClientExt<R: Runtime> {
    fn webdav_client(&self) -> &WebDAVClient<R>;
}

impl<R: Runtime, T: Manager<R>> crate::WebdavClientExt<R> for T {
    fn webdav_client(&self) -> &WebDAVClient<R> {
        self.state::<WebDAVClient<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("webdav-client")
        .invoke_handler(tauri::generate_handler![])
        .setup(|app, api| {
            #[cfg(desktop)]
            let webdav_client = desktop::init(app, api)?;
            app.manage(webdav_client);
            Ok(())
        })
        .build()
}
