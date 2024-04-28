use std::path::PathBuf;

fn main() {
    let out_dir = PathBuf::from(std::env::var("OUT_DIR").unwrap());
    tonic_build::configure()
        .type_attribute("retrom.Platform", "#[derive(derive_builder::Builder)]")
        .type_attribute("retrom.Game", "#[derive(derive_builder::Builder)]")
        .type_attribute("retrom.GameFile", "#[derive(derive_builder::Builder)]")
        .type_attribute("retrom.Metadata", "#[derive(derive_builder::Builder)]")
        .file_descriptor_set_path(out_dir.join("retrom_descriptor.bin"))
        .compile(&["../../protos/retrom.proto"], &["../../protos"])
        .unwrap();

    tonic_build::configure()
        .compile(&["../../protos/igdb.proto"], &["../../protos"])
        .unwrap();
}
