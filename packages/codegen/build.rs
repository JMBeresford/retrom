use std::path::PathBuf;
use walkdir::WalkDir;

// Derives for structs representing existing rows read from the DB.
const ROW_DERIVES: [&str; 1] = ["sqlx::FromRow"];

fn main() -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(feature = "protobuf-src")]
    std::env::set_var("PROTOC", protobuf_src::protoc());

    let out_dir = PathBuf::from(std::env::var("OUT_DIR").expect("OUT_DIR not set"));

    let row_derivations = ROW_DERIVES.to_vec().join(",");

    let proto_paths: Vec<PathBuf> = WalkDir::new("./protos")
        .follow_links(true)
        .into_iter()
        .filter_map(|dir_entry| dir_entry.ok())
        .map(|dir_entry| PathBuf::from(dir_entry.path()))
        .filter(|path| path.extension() == Some("proto".as_ref()))
        .collect();

    let row_models = [
        "retrom.services.clients.v1.Client",
        "retrom.services.library.v1.Library",
        "retrom.services.library.v1.RootDirectory",
        "retrom.services.library.v1.Platform",
        "retrom.services.library.v1.Game",
        "retrom.services.library.v1.GameFile",
        "retrom.services.metadata.v1.GameMetadata",
        "retrom.services.metadata.v1.PlatformMetadata",
        "retrom.services.metadata.v1.GameMetadataArtwork",
        "retrom.services.metadata.v1.GameMetadataScreenshot",
        "retrom.services.metadata.v1.GameMetadataVideo",
        "retrom.services.metadata.v1.GameMetadataLink",
        "retrom.services.metadata.v1.MetadataProvider",
        "retrom.services.emulators.v1.Emulator",
        "retrom.services.emulators.v1.EmulatorPlatform",
        "retrom.services.emulators.v1.EmulatorOperatingSystem",
        "retrom.services.emulators.v1.EmulatorProfile",
        "retrom.services.emulators.v1.EmulatorProfileExtension",
        "retrom.services.emulators.v1.DefaultEmulatorProfile",
        "retrom.services.emulators.v1.LocalEmulatorConfig",
        "retrom.services.tags.v1.TagDomain",
        "retrom.services.tags.v1.Tag",
    ];

    let mut build = tonic_prost_build::configure()
        .type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]")
        .extern_path(".google.protobuf.Timestamp", "crate::timestamp::Timestamp")
        .extern_path(".google.protobuf.Duration", "::prost_wkt_types::Duration")
        .extern_path(".google.protobuf.Value", "::prost_wkt_types::Value")
        .extern_path(".google.protobuf.FieldMask", "::prost_wkt_types::FieldMask")
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

    for model_name in row_models.into_iter() {
        build = build.type_attribute(
            model_name,
            format!("#[derive({row_derivations})]\n#[sqlx(default)]"),
        );
    }

    build
        .file_descriptor_set_path(out_dir.join("retrom_descriptor.bin"))
        .compile_protos(&proto_paths, &[PathBuf::from("./protos/")])?;

    Ok(())
}
