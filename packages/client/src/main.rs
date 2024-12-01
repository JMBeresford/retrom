// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use retrom_codegen::retrom::RetromClientConfig;
use std::{fs::OpenOptions, str, sync::Mutex};
use tauri::{AppHandle, Manager};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!! You've been greeted from Rust!", name)
}

type ManagedConfig = Mutex<RetromClientConfig>;

#[tauri::command]
fn set_config(app: AppHandle, new_config: RetromClientConfig) {
    tracing::debug!("Setting new config: {:?}", new_config);
    match app.try_state::<ManagedConfig>() {
        Some(config) => {
            *config.lock().unwrap() = new_config;
        }
        None => {
            app.manage::<ManagedConfig>(Mutex::new(new_config));
        }
    }
}

#[tokio::main]
pub async fn main() {
    dotenvy::dotenv().ok();

    let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "info,".into())
        .add_directive("app=warn".parse().unwrap());

    let fmt_layer = tracing_subscriber::fmt::layer()
        .pretty()
        .without_time()
        .with_target(false)
        .with_ansi(true);

    let registry = tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer);

    tauri::Builder::default()
        .setup(|app| {
            let log_dir = app.path().app_log_dir().expect("failed to get log dir");

            if !log_dir.exists() {
                std::fs::create_dir_all(&log_dir).unwrap();
            }

            let log_file = OpenOptions::new()
                .write(true)
                .create(true)
                .truncate(true)
                .open(log_dir.join("retrom.log"))
                .expect("failed to open log file");

            let file_layer = tracing_subscriber::fmt::layer()
                .json()
                .with_writer(log_file);

            registry.with(file_layer).init();

            Ok(())
        })
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            app.webview_windows()
                .values()
                .next()
                .expect("no window found")
                .set_focus()
                .expect("failed to set focus");
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_system_info::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(retrom_plugin_service_client::init())
        .plugin(retrom_plugin_steam::init())
        .plugin(retrom_plugin_installer::init())
        .plugin(retrom_plugin_launcher::init().await)
        .invoke_handler(tauri::generate_handler![greet, set_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
