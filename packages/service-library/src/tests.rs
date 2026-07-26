use std::path::{Path, PathBuf};

use retrom_db::DbPool;
use tempfile::TempDir;

pub async fn get_test_db_pool() -> DbPool {
    std::env::set_var("RETROM_DB_URL", "sqlite::memory:");

    let pool = retrom_db::connect()
        .await
        .expect("Failed to connect to test database");

    retrom_db::run_migrations(&pool)
        .await
        .expect("Failed to run migrations on test database");

    pool
}

pub async fn create_test_library_dir() -> TempDir {
    tempfile::tempdir().expect("Failed to create temporary directory")
}

pub async fn create_test_platform_dir(library_dir: &TempDir, name: &str) -> PathBuf {
    let platform_dir = library_dir.path().join(name);
    tokio::fs::create_dir_all(&platform_dir)
        .await
        .expect("Failed to create platform directory");

    platform_dir
}

pub async fn create_test_game_dir(platform_dir: impl AsRef<Path>, name: &str) -> PathBuf {
    let game_dir = platform_dir.as_ref().join(name);
    tokio::fs::create_dir_all(&game_dir)
        .await
        .expect("Failed to create game directory");

    game_dir
}

pub async fn create_test_game_file(game_dir: impl AsRef<Path>, name: &str) -> PathBuf {
    let game_file = game_dir.as_ref().join(name);
    tokio::fs::write(&game_file, b"Test game file content")
        .await
        .expect("Failed to create game file");

    game_file
}

