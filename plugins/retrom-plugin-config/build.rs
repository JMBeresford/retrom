const COMMANDS: &[&str] = &["get_config", "set_config"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
