// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use retrom_codegen::retrom::RetromHostInfo;
use std::str;
use tauri::Manager;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!! You've been greeted from Rust!", name)
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
        .plugin(tauri_plugin_updater::Builder::new().build())
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
