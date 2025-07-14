// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use retrom_plugin_config::ConfigExt;
use std::fs::OpenOptions;
use tauri::Manager;
use tracing_opentelemetry::{MetricsLayer, OpenTelemetryLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, Layer};

#[tokio::main]
pub async fn main() {
    dotenvy::dotenv().ok();

    tauri::async_runtime::set(tokio::runtime::Handle::current());

    tauri::Builder::default()
        .plugin(retrom_plugin_config::init())
        .setup(|app| {
            let mut layers = vec![];

            let env_filter = tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,".into())
                .add_directive("app=warn".parse().unwrap());

            let fmt_layer = tracing_subscriber::fmt::layer()
                .pretty()
                .without_time()
                .with_target(false)
                .with_ansi(true)
                .boxed();

            layers.push(fmt_layer);

            let config = app.config_manager().get_config_blocking();

            if config.telemetry.is_some_and(|t| t.enabled) {
                use opentelemetry::trace::TracerProvider;

                let tracer_provider = retrom_service::trace::get_tracer_provider();
                let meter_provider = retrom_service::trace::init_meter_provider();

                let tracer = tracer_provider.tracer("main");

                let metrics_layer = MetricsLayer::new(meter_provider).boxed();
                let telemetry_layer = OpenTelemetryLayer::new(tracer).boxed();

                layers.push(metrics_layer);
                layers.push(telemetry_layer);
            }

            let registry = tracing_subscriber::registry().with(layers).with(env_filter);

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

            if let Err(why) = app
                .handle()
                .plugin(tauri_plugin_window_state::Builder::default().build())
            {
                tracing::error!("Failed to initialize window state plugin: {}", why);
            }

            let app_handle = app.handle().clone();
            tokio::spawn(async move {
                tokio::signal::ctrl_c()
                    .await
                    .expect("Failed to listen for ctrl-c");

                app_handle.exit(0);
            });

            Ok(())
        })
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(retrom_plugin_standalone::init())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if !cfg!(dev) {
                app.webview_windows()
                    .values()
                    .next()
                    .expect("no window found")
                    .set_focus()
                    .expect("failed to set focus");
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_system_info::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(retrom_plugin_service_client::init())
        .plugin(retrom_plugin_steam::init())
        .plugin(retrom_plugin_installer::init())
        .plugin(retrom_plugin_launcher::init().await)
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
