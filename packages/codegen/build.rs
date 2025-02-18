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
        )
        .field_attribute(
            "retrom.IGDBConfig.client_id",
            "#[serde(alias = \"client_id\", alias = \"clientId\")]",
        )
        .field_attribute(
            "retrom.IGDBConfig.client_secret",
            "#[serde(alias = \"client_secret\", alias = \"clientSecret\")]",
        )
        .field_attribute(
            "retrom.SteamConfig.api_key",
            "#[serde(alias = \"api_key\", alias = \"apiKey\")]",
        )
        .field_attribute(
            "retrom.SteamConfig.user_id",
            "#[serde(alias = \"user_id\", alias = \"userId\")]",
        )
        .field_attribute(
            "retrom.ConnectionConfig.db_url",
            "#[serde(alias = \"db_url\", alias = \"dbUrl\")]",
        )
        .field_attribute(
            "retrom.ServerConfig.content_directories",
            "#[serde(alias = \"content_directories\", alias = \"contentDirectories\")]",
        )
        .field_attribute(
            "retrom.ContentDirectory.storage_type",
            "#[serde(deserialize_with = \"crate::storage_type::deserialize\", \
                alias = \"storage_type\", alias = \"storageType\")]",
        );

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
