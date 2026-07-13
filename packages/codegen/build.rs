use std::error::Error;
use std::path::PathBuf;
use std::process::{exit, Command};

fn main() -> Result<(), Box<dyn Error>> {
    let bin_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("node_modules/.bin");
    let current_path = std::env::var("PATH").unwrap_or_default();
    let mut paths: Vec<PathBuf> = std::env::split_paths(&current_path).collect();
    paths.push(bin_path);

    let new_path = std::env::join_paths(paths).expect("Failed to join paths");

    let status = Command::new("buf")
        .arg("generate")
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .env("PATH", new_path)
        .status()
        .expect("Failed to execute buf generate command");

    if !status.success() {
        exit(status.code().unwrap_or(-1))
    }

    Ok(())
}
