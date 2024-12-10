const COMMANDS: &[&str] = &["enable_standalone_mode", "disable_standalone_mode"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
