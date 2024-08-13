// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use retrom_codegen::retrom::RetromHostInfo;
use std::str;
use tauri::{is_dev, path::BaseDirectory, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tokio::main]
pub async fn main() {
    dotenvy::dotenv().ok();
    let port = std::env::var("RETROM_PORT").unwrap_or_else(|_| "5101".to_string());

    let host_name =
        std::env::var("RETROM_HOSTNAME").unwrap_or_else(|_| "http://localhost".to_string());

    let host = format!("{host_name}:{port}");

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "info,".into())
        .add_directive("app=warn".parse().unwrap());

    let fmt_layer = tracing_subscriber::fmt::layer()
        .pretty()
        .without_time()
        .with_target(false)
        .with_ansi(true);

    tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer)
        .init();

    tauri::Builder::default()
        .manage(RetromHostInfo {
            host_name,
            host,
            port,
        })
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            app.webview_windows()
                .values()
                .next()
                .expect("no window found")
                .set_focus()
                .expect("failed to set focus");
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(retrom_plugin_installer::init())
        .plugin(retrom_plugin_launcher::init().await)
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            if is_dev() {
                return Ok(());
            }

            let web_server_path = "web/.next/node-server/packages/client/web/server.js";
            let path = app
                .path()
                .resolve(web_server_path, BaseDirectory::Resource)?;

            #[cfg(target_os = "windows")]
            let executable = "node.exe";
            #[cfg(not(target_os = "windows"))]
            let executable = "node";

            let cmd = app.shell().sidecar(executable).unwrap().args([path]);

            let (mut rx, _) = cmd.spawn().expect("failed to spawn sidecar");

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            if let Ok(s) = str::from_utf8(&line) {
                                tracing::info!("{}", s)
                            }
                        }
                        CommandEvent::Terminated(payload) => {
                            if let Some(code) = payload.code {
                                if code != 0 {
                                    tracing::error!("Node server exited with code: {}", code);
                                }
                            }
                        }
                        CommandEvent::Stderr(line) => {
                            if let Ok(s) = str::from_utf8(&line) {
                                tracing::error!("{}", s)
                            }
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
