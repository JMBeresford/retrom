// @generated automatically by Diesel CLI.

diesel::table! {
    default_emulator_profiles (platform_id) {
        platform_id -> Int4,
        emulator_profile_id -> Int4,
    }
}

diesel::table! {
    emulator_profiles (id) {
        id -> Int4,
        emulator_id -> Int4,
        name -> Text,
        executable_path -> Text,
        supported_extensions -> Array<Text>,
        custom_args -> Array<Text>,
    }
}

diesel::table! {
    emulators (id) {
        id -> Int4,
        supported_platforms -> Array<Int4>,
        name -> Text,
        rom_type -> Int4,
    }
}

diesel::table! {
    game_files (id) {
        id -> Int4,
        byte_size -> Int4,
        path -> Text,
        game_id -> Int4,
    }
}

diesel::table! {
    game_metadata (game_id) {
        game_id -> Int4,
        name -> Nullable<Text>,
        description -> Nullable<Text>,
        cover_url -> Nullable<Text>,
        background_url -> Nullable<Text>,
        icon_url -> Nullable<Text>,
        igdb_id -> Nullable<Int8>,
    }
}

diesel::table! {
    games (id) {
        id -> Int4,
        path -> Text,
        platform_id -> Nullable<Int4>,
    }
}

diesel::table! {
    platform_metadata (platform_id) {
        platform_id -> Int4,
        name -> Nullable<Text>,
        description -> Nullable<Text>,
        background_url -> Nullable<Text>,
        logo_url -> Nullable<Text>,
        igdb_id -> Nullable<Int8>,
    }
}

diesel::table! {
    platforms (id) {
        id -> Int4,
        path -> Text,
    }
}

diesel::joinable!(default_emulator_profiles -> emulator_profiles (emulator_profile_id));
diesel::joinable!(default_emulator_profiles -> platforms (platform_id));
diesel::joinable!(emulator_profiles -> emulators (emulator_id));
diesel::joinable!(game_files -> games (game_id));
diesel::joinable!(game_metadata -> games (game_id));
diesel::joinable!(games -> platforms (platform_id));
diesel::joinable!(platform_metadata -> platforms (platform_id));

diesel::allow_tables_to_appear_in_same_query!(
    default_emulator_profiles,
    emulator_profiles,
    emulators,
    game_files,
    game_metadata,
    games,
    platform_metadata,
    platforms,
);
