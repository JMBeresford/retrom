// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;
use tauri::async_runtime::Mutex;

use generated::retrom::{
    game_service_client::GameServiceClient, metadata_service_client::MetadataServiceClient,
    platform_service_client::PlatformServiceClient,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod games_client;
mod metadata_client;
mod platforms_client;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tokio::main]
pub async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,".into())
                .add_directive("h2=info".parse().unwrap()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let host = "http://localhost:5001";

    let games_client = GameServiceClient::connect(host)
        .await
        .expect("Could not connect to server");

    let platforms_client = PlatformServiceClient::connect(host)
        .await
        .expect("Could not connect to server");

    let metadata_client = MetadataServiceClient::connect(host)
        .await
        .expect("Could not connect to server");

    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(games_client)))
        .manage(Arc::new(Mutex::new(platforms_client)))
        .manage(Arc::new(Mutex::new(metadata_client)))
        .invoke_handler(tauri::generate_handler![
            greet,
            games_client::get_games,
            platforms_client::get_platforms,
            metadata_client::get_game_metadata,
            metadata_client::update_game_metadata,
            metadata_client::get_platform_metadata,
            metadata_client::update_platform_metadata,
            metadata_client::get_igdb_search,
            metadata_client::get_igdb_game_search_results,
            metadata_client::get_igdb_platform_search_results
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
