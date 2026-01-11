const COMMANDS: &[&str] = &["get_emulator_saves_sync_status", "sync_emulator_saves"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
