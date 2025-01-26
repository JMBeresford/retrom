use std::collections::HashSet;

use notify::{EventKind, Watcher};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Emitter, Manager, Runtime,
};

mod commands;
mod desktop;
mod error;

pub use error::{Error, Result};

use desktop::Steam;
use tracing::instrument;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the steam APIs.
pub trait SteamExt<R: Runtime> {
    fn steam(&self) -> &Steam<R>;
}

impl<R: Runtime, T: Manager<R>> crate::SteamExt<R> for T {
    fn steam(&self) -> &Steam<R> {
        self.state::<Steam<R>>().inner()
    }
}

/// Initializes the plugin.
#[instrument(skip_all)]
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("steam")
        .invoke_handler(tauri::generate_handler![])
        .setup(|app, api| {
            let steam = match desktop::init(app, api) {
                Ok(steam) => steam,
                Err(e) => {
                    tracing::warn!(
                        "Failed to initialize steam plugin, is steam installed: {:?}",
                        e
                    );
                    return Ok(());
                }
            };

            let handle = app.app_handle().clone();
            std::thread::spawn(move || {
                let steam = match steamlocate::SteamDir::locate() {
                    Ok(steam) => steam,
                    Err(e) => {
                        tracing::debug!("Could not locate steam directory: {:?}", e);
                        return;
                    }
                };

                let libraries = steam.library_paths().unwrap_or_default();

                let mut apps_installed = match steam.libraries() {
                    Ok(libraries) => libraries
                        .filter_map(std::result::Result::ok)
                        .flat_map(|lib| lib.app_ids().to_vec())
                        .collect::<HashSet<_>>(),

                    Err(e) => {
                        tracing::debug!("Could not get steam libraries: {:?}", e);
                        return;
                    }
                };

                let (tx, rx) = std::sync::mpsc::channel::<notify::Result<notify::Event>>();

                let mut watchers = vec![];
                for lib in libraries.iter() {
                    let tx = tx.clone();
                    let mut watcher = match notify::recommended_watcher(tx) {
                        Ok(watcher) => watcher,
                        Err(e) => {
                            tracing::warn!("Error creating watcher: {:?}", e);
                            continue;
                        }
                    };

                    if let Err(why) = watcher.watch(lib.as_path(), notify::RecursiveMode::Recursive)
                    {
                        tracing::warn!("Error watching directory: {:?}", why);
                        continue;
                    }

                    watchers.push(watcher);
                }

                for res in rx {
                    match res {
                        Ok(event) => match event.kind {
                            EventKind::Create(_) | EventKind::Remove(_) => {
                                let libraries = match steam.libraries() {
                                    Ok(libraries) => libraries,
                                    Err(e) => {
                                        tracing::warn!("Could not get steam libraries: {:?}", e);
                                        continue;
                                    }
                                };

                                let app_ids = libraries
                                    .filter_map(std::result::Result::ok)
                                    .flat_map(|lib| lib.app_ids().to_vec())
                                    .collect::<HashSet<_>>();

                                let newly_installed = app_ids.difference(&apps_installed);
                                let newly_uninstalled = apps_installed.difference(&app_ids);

                                if newly_installed.count() > 0 {
                                    if let Err(why) = handle.emit("steam-game-installed", ()) {
                                        tracing::error!("Error emitting event: {:?}", why);
                                    }
                                }

                                if newly_uninstalled.count() > 0 {
                                    if let Err(why) = handle.emit("steam-game-uninstalled", ()) {
                                        tracing::error!("Error emitting event: {:?}", why);
                                    }
                                }

                                apps_installed = app_ids;
                            }
                            _ => {}
                        },
                        Err(e) => {
                            tracing::error!("watch error: {:?}", e);
                        }
                    }
                }
            });

            app.manage(steam);
            Ok(())
        })
        .build()
}
