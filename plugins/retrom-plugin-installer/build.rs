const COMMANDS: &[&str] = &[
    "install_game",
    "uninstall_game",
    "get_installation_status",
    "get_installation_index",
    "open_installation_dir",
    "migrate_installation_dir",
    "clear_installation_dir",
    "update_steam_installations",
    "subscribe_to_installation_updates",
    "unsubscribe_from_installation_updates",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
