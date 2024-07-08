const COMMANDS: &[&str] = &["play_game", "stop_game", "get_game_play_status"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
