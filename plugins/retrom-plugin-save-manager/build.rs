const COMMANDS: &[&str] = &[
    "get_emulator_saves_sync_status",
    "sync_emulator_saves",
    "get_emulator_save_states_sync_status",
    "sync_emulator_save_states",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
