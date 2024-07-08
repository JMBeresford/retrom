const COMMANDS: &[&str] = &[
    "install_game",
    "uninstall_game",
    "get_game_installation_status",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
