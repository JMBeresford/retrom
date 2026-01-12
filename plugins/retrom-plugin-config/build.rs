const COMMANDS: &[&str] = &["get_config", "set_config", "is_flatpak"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
