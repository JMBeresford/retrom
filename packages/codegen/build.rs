use std::path::PathBuf;
use walkdir::WalkDir;

// Derives that are used for structs representing existing rows in db
const DIESEL_ROW_DERIVES: [&str; 3] = [
    "Queryable",
    "Selectable",
    "Identifiable",
    // "Insertable",
    // "AsChangeset",
];

// Derives that are used for structs representing changesets, or to-be-inserted rows
const DIESEL_NON_ROW_DERIVES: [&str; 2] = ["Insertable", "AsChangeset"];

const OTHER_DERIVES: [&str; 3] = ["derive_builder::Builder", "Hash", "Eq"];

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = PathBuf::from(std::env::var("OUT_DIR").expect("OUT_DIR not set"));
    let other_derivations = OTHER_DERIVES
        .iter()
        .map(|d| format!("{d}"))
        .collect::<Vec<String>>()
        .join(",");

    let diesel_row_derivations = DIESEL_ROW_DERIVES
        .iter()
        .map(|d| format!("diesel::{d}"))
        .collect::<Vec<String>>()
        .join(",");

    let diesel_non_row_derivations = DIESEL_NON_ROW_DERIVES
        .iter()
        .map(|d| format!("diesel::{d}"))
        .collect::<Vec<String>>()
        .join(",");

    let proto_paths: Vec<PathBuf> = WalkDir::new("./protos/retrom")
        .follow_links(true)
        .into_iter()
        .filter_map(|dir_entry| dir_entry.ok())
        .map(|dir_entry| PathBuf::from(dir_entry.path()))
        .filter(|path| path.extension() == Some("proto".as_ref()))
        .collect();

    tonic_build::configure()
        .type_attribute(".retrom", "#[derive(serde::Serialize, serde::Deserialize)]")
        .message_attribute(
            ".retrom",
            "#[serde(rename_all(serialize = \"camelCase\", deserialize = \"camelCase\"))]",
        )
        .type_attribute(
            "retrom.Platform",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("platforms", None)
            ),
        )
        .type_attribute(
            "retrom.NewPlatform",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("platforms", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedPlatform",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("platforms", None)
            ),
        )
        .type_attribute(
            "retrom.Game",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("games", None)
            ),
        )
        .type_attribute(
            "retrom.NewGame",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("games", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedGame",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("games", None)
            ),
        )
        .type_attribute(
            "retrom.GameFile",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("game_files", None)
            ),
        )
        .type_attribute(
            "retrom.NewGameFile",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("game_files", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedGameFile",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("game_files", None)
            ),
        )
        .type_attribute(
            "retrom.GameMetadata",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("game_metadata", "game_id".into())
            ),
        )
        .type_attribute(
            "retrom.NewGameMetadata",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("game_metadata", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedGameMetadata",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("game_metadata", None)
            ),
        )
        .type_attribute(
            "retrom.PlatformMetadata",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("platform_metadata", "platform_id".into())
            ),
        )
        .type_attribute(
            "retrom.NewPlatformMetadata",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("platform_metadata", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedPlatformMetadata",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("platform_metadata", None)
            ),
        )
        .type_attribute(
            "retrom.Emulator",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("emulators", None)
            ),
        )
        .type_attribute(
            "retrom.NewEmulator",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("emulators", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedEmulator",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("emulators", None)
            ),
        )
        .type_attribute(
            "retrom.EmulatorProfile",
            format!(
                "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("emulator_profiles", None)
            ),
        )
        .type_attribute(
            "retrom.NewEmulatorProfile",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("emulator_profiles", None)
            ),
        )
        .type_attribute(
            "retrom.UpdatedEmulatorProfile",
            format!(
                "#[derive({diesel_non_row_derivations},{other_derivations})]\n{}",
                get_diesel_macro("emulator_profiles", None)
            ),
        )
        .file_descriptor_set_path(out_dir.join("retrom_descriptor.bin"))
        .compile(&proto_paths, &["./protos/retrom/"])?;

    tonic_build::configure().compile(&["./protos/igdb.proto"], &["./protos"])?;

    Ok(())
}

fn get_diesel_macro(table_name: &str, primary_key: Option<&str>) -> String {
    let primary_key_clause = match primary_key {
        Some(pk) => format!(", primary_key({pk})"),
        None => "".to_string(),
    };

    format!("#[diesel(table_name = retrom_db::schema::{table_name}, check_for_backend(diesel::pg::Pg){primary_key_clause})]")
}
