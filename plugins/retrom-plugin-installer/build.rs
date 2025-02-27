const COMMANDS: &[&str] = &[
    "install_game",
    "uninstall_game",
    "get_game_installation_status",
    "get_installation_state",
    "open_installation_dir",
    "migrate_installation_dir",
    "clear_installation_dir",
    "update_steam_installations",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
