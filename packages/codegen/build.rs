use std::path::PathBuf;
use walkdir::WalkDir;

// Derives that are used for structs representing existing rows in db
const DIESEL_ROW_DERIVES: [&str; 5] = [
    "Queryable",
    "Selectable",
    "Identifiable",
    "Insertable",
    "AsChangeset",
];

type ModelDefinitionParams = (
    &'static str,
    &'static str,
    Option<&'static str>,
    Vec<&'static str>,
);

// Derives that are used for structs representing new rows to be inserted into db
const DIESEL_INSERTABLE_DERIVES: [&str; 1] = ["Insertable"];

// Derives that are used for structs representing changesets, or to-be-updated rows
const DIESEL_UPDATE_DERIVES: [&str; 3] = ["AsChangeset", "Insertable", "Identifiable"];

const OTHER_DERIVES: [&str; 2] = ["Hash", "Eq"];

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = PathBuf::from(std::env::var("OUT_DIR").expect("OUT_DIR not set"));
    let other_derivations = OTHER_DERIVES
        .iter()
        .map(|d| d.to_string())
        .collect::<Vec<String>>()
        .join(",");

    let diesel_row_derivations = DIESEL_ROW_DERIVES
        .iter()
        .map(|d| format!("diesel::{d}"))
        .collect::<Vec<String>>()
        .join(",");

    let diesel_insertable_derivations = DIESEL_INSERTABLE_DERIVES
        .iter()
        .map(|d| format!("diesel::{d}"))
        .collect::<Vec<String>>()
        .join(",");

    let diesel_update_derivations = DIESEL_UPDATE_DERIVES
        .iter()
        .map(|d| format!("diesel::{d}"))
        .collect::<Vec<String>>()
        .join(",");

    let proto_paths: Vec<PathBuf> = WalkDir::new("./protos")
        .follow_links(true)
        .into_iter()
        .filter_map(|dir_entry| dir_entry.ok())
        .map(|dir_entry| PathBuf::from(dir_entry.path()))
        .filter(|path| path.extension() == Some("proto".as_ref()))
        .collect();

    let queryable_models: [ModelDefinitionParams; 13] = [
        ("Platform", "platforms", None, vec![]),
        ("Game", "games", None, vec![]),
        (
            "GameFile",
            "game_files",
            None,
            vec!["Game, foreign_key = game_id"],
        ),
        (
            "GameMetadata",
            "game_metadata",
            Some("game_id"),
            vec!["Game, foreign_key = game_id"],
        ),
        (
            "PlatformMetadata",
            "platform_metadata",
            Some("platform_id"),
            vec!["Platform, foreign_key = platform_id"],
        ),
        ("Client", "clients", None, vec![]),
        ("Emulator", "emulators", None, vec![]),
        (
            "EmulatorProfile",
            "emulator_profiles",
            None,
            vec!["Emulator, foreign_key = emulator_id"],
        ),
        (
            "DefaultEmulatorProfile",
            "default_emulator_profiles",
            Some("platform_id"),
            vec![
                "Platform, foreign_key = platform_id",
                "Client, foreign_key = client_id",
                "EmulatorProfile, foreign_key = emulator_profile_id",
            ],
        ),
        ("GameGenre", "game_genres", None, vec![]),
        (
            "GameGenreMap",
            "game_genre_maps",
            Some("game_id, genre_id"),
            vec![
                "GameGenre, foreign_key = genre_id",
                "Game, foreign_key = game_id",
            ],
        ),
        (
            "SimilarGameMap",
            "similar_game_maps",
            Some("game_id, similar_game_id"),
            vec!["Game, foreign_key = game_id"],
        ),
        (
            "LocalEmulatorConfig",
            "local_emulator_configs",
            None,
            vec!["Emulator", "Client"],
        ),
    ];

    let insertable_models: [ModelDefinitionParams; 13] = [
        ("NewPlatform", "platforms", None, vec![]),
        ("NewGame", "games", None, vec![]),
        ("NewGameFile", "game_files", None, vec![]),
        ("NewGameMetadata", "game_metadata", Some("game_id"), vec![]),
        ("NewPlatformMetadata", "platform_metadata", None, vec![]),
        ("NewClient", "clients", None, vec![]),
        ("NewEmulator", "emulators", None, vec![]),
        ("NewEmulatorProfile", "emulator_profiles", None, vec![]),
        (
            "NewDefaultEmulatorProfile",
            "default_emulator_profiles",
            None,
            vec![],
        ),
        ("NewGameGenre", "game_genres", None, vec![]),
        (
            "NewGameGenreMap",
            "game_genre_maps",
            Some("game_id, genre_id"),
            vec![],
        ),
        (
            "NewSimilarGameMap",
            "similar_game_maps",
            Some("game_id, similar_game_id"),
            vec![],
        ),
        (
            "NewLocalEmulatorConfig",
            "local_emulator_configs",
            None,
            vec![],
        ),
    ];

    let updatable_models: [ModelDefinitionParams; 13] = [
        ("UpdatedPlatform", "platforms", None, vec![]),
        ("UpdatedGame", "games", None, vec![]),
        ("UpdatedGameFile", "game_files", None, vec![]),
        (
            "UpdatedGameMetadata",
            "game_metadata",
            Some("game_id"),
            vec![],
        ),
        (
            "UpdatedPlatformMetadata",
            "platform_metadata",
            Some("platform_id"),
            vec![],
        ),
        ("UpdatedClient", "clients", None, vec![]),
        ("UpdatedEmulator", "emulators", None, vec![]),
        ("UpdatedEmulatorProfile", "emulator_profiles", None, vec![]),
        (
            "UpdatedDefaultEmulatorProfile",
            "default_emulator_profiles",
            Some("platform_id"),
            vec![],
        ),
        ("UpdatedGameGenre", "game_genres", None, vec![]),
        (
            "UpdatedGameGenreMap",
            "game_genre_maps",
            Some("game_id, genre_id"),
            vec![],
        ),
        (
            "UpdatedSimilarGameMap",
            "similar_game_maps",
            Some("game_id, similar_game_id"),
            vec![],
        ),
        (
            "UpdatedLocalEmulatorConfig",
            "local_emulator_configs",
            None,
            vec!["Emulator", "Client"],
        ),
    ];

    let mut build = tonic_build::configure()
        .type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]")
        .extern_path(".google.protobuf.Timestamp", "crate::timestamp::Timestamp")
        .extern_path(".google.protobuf.Duration", "::prost_wkt_types::Duration")
        .extern_path(".google.protobuf.Value", "::prost_wkt_types::Value")
        .message_attribute(
            ".retrom",
            "#[serde(rename_all(serialize = \"camelCase\", deserialize = \"camelCase\"))]",
        );
    // .type_attribute(
    //     "retrom.Platform",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("platforms", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewPlatform",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("platforms", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedPlatform",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("platforms", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.Game",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("games", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewGame",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("games", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedGame",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("games", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.GameFile",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_files", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewGameFile",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_files", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedGameFile",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_files", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.GameMetadata",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_metadata", "game_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewGameMetadata",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_metadata", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedGameMetadata",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_metadata", "game_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.PlatformMetadata",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("platform_metadata", "platform_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewPlatformMetadata",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("platform_metadata", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedPlatformMetadata",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("platform_metadata", "platform_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.Client",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("clients", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewClient",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("clients", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedClient",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("clients", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.Emulator",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("emulators", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewEmulator",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("emulators", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedEmulator",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("emulators", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.EmulatorProfile",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("emulator_profiles", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewEmulatorProfile",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("emulator_profiles", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedEmulatorProfile",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("emulator_profiles", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.DefaultEmulatorProfile",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("default_emulator_profiles", "platform_id, client_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewDefaultEmulatorProfile",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("default_emulator_profiles", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedDefaultEmulatorProfile",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("default_emulator_profiles", "platform_id, client_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.GameGenre",
    //     format!(
    //         "#[derive({diesel_row_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_genres", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewGameGenre",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_genres", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedGameGenre",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_genres", None)
    //     ),
    // )
    // .type_attribute(
    //     "retrom.GameGenreMap",
    //     format!(
    //         "#[derive({diesel_row_derivations},diesel::Associations,{other_derivations})]\n{}\n#[diesel(belongs_to(Game))]\n#[diesel(belongs_to())]",
    //         get_diesel_macro("game_genre_maps", "game_id, genre_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewGameGenreMap",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_genre_maps", "game_id, genre_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedGameGenreMap",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("game_genre_maps", "game_id, genre_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.SimilarGameMap",
    //     format!(
    //         "#[derive({diesel_row_derivations},diesel::Associations,{other_derivations})]\n{}\n#[diesel(belongs_to(Game, foreign_key = game_id))]",
    //         get_diesel_macro("similar_game_maps", "game_id, similar_game_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.NewSimilarGameMap",
    //     format!(
    //         "#[derive({diesel_insertable_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("similar_game_maps", "game_id, similar_game_id".into())
    //     ),
    // )
    // .type_attribute(
    //     "retrom.UpdatedSimilarGameMap",
    //     format!(
    //         "#[derive({diesel_update_derivations},{other_derivations})]\n{}",
    //         get_diesel_macro("similar_game_maps", "game_id, similar_game_id".into())
    //     ),
    // );

    for (model_name, table_name, primary_key, belongs_to) in queryable_models.into_iter() {
        let derives = match belongs_to.len() {
            0 => format!("#[derive({diesel_row_derivations},{other_derivations})]",),
            _ => format!(
                "#[derive({diesel_row_derivations},diesel::Associations,{other_derivations})]",
            ),
        };

        let diesel_macro_clause = get_diesel_macro(table_name, primary_key, belongs_to);

        build = build.type_attribute(
            format!("retrom.{}", model_name),
            format!("{derives}\n{diesel_macro_clause}",),
        );
    }

    for (model_name, table_name, primary_key, belongs_to) in insertable_models.into_iter() {
        let derives = match belongs_to.len() {
            0 => format!("#[derive({diesel_insertable_derivations},{other_derivations})]",),
            _ => format!(
                "#[derive({diesel_insertable_derivations},diesel::Associations,{other_derivations})]",
            ),
        };

        let diesel_macro_clause = get_diesel_macro(table_name, primary_key, belongs_to);

        build = build.type_attribute(
            format!("retrom.{}", model_name),
            format!("{derives}\n{diesel_macro_clause}",),
        );
    }

    for (model_name, table_name, primary_key, belongs_to) in updatable_models.into_iter() {
        let derives = match belongs_to.len() {
            0 => format!("#[derive({diesel_update_derivations},{other_derivations})]",),
            _ => format!(
                "#[derive({diesel_update_derivations},diesel::Associations,{other_derivations})]",
            ),
        };

        let diesel_macro_clause = get_diesel_macro(table_name, primary_key, belongs_to);

        build = build.type_attribute(
            format!("retrom.{}", model_name),
            format!("{derives}\n{diesel_macro_clause}",),
        );
    }

    build
        .file_descriptor_set_path(out_dir.join("retrom_descriptor.bin"))
        .compile(&proto_paths, &["./protos/"])?;

    Ok(())
}

fn get_diesel_macro(table_name: &str, primary_key: Option<&str>, belongs_to: Vec<&str>) -> String {
    let primary_key_clause = match primary_key {
        Some(pk) => format!(", primary_key({pk})"),
        None => "".to_string(),
    };

    let belongs_to_clauses = belongs_to
        .iter()
        .map(|b| format!(", belongs_to({b})"))
        .collect::<Vec<String>>()
        .join("");

    format!(
        "#[diesel(table_name = retrom_db::schema::{table_name}, \
        check_for_backend(diesel::pg::Pg){primary_key_clause}{belongs_to_clauses})]"
    )
}
