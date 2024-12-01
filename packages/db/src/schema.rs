// @generated automatically by Diesel CLI.

diesel::table! {
    clients (id) {
        id -> Int4,
        name -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    default_emulator_profiles (platform_id, client_id) {
        platform_id -> Int4,
        emulator_profile_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        client_id -> Int4,
    }
}

diesel::table! {
    emulator_profiles (id) {
        id -> Int4,
        emulator_id -> Int4,
        name -> Text,
        supported_extensions -> Array<Text>,
        custom_args -> Array<Text>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    emulators (id) {
        id -> Int4,
        supported_platforms -> Array<Int4>,
        name -> Text,
        save_strategy -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    game_files (id) {
        id -> Int4,
        byte_size -> Int8,
        path -> Text,
        game_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        deleted_at -> Nullable<Timestamptz>,
        is_deleted -> Bool,
    }
}

diesel::table! {
    game_genre_maps (game_id, genre_id) {
        game_id -> Int4,
        genre_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    game_genres (id) {
        id -> Int4,
        slug -> Text,
        name -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
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
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        links -> Array<Text>,
        video_urls -> Array<Text>,
        screenshot_urls -> Array<Text>,
        artwork_urls -> Array<Text>,
        release_date -> Nullable<Timestamptz>,
        last_played -> Nullable<Timestamptz>,
        minutes_played -> Nullable<Int4>,
    }
}

diesel::table! {
    games (id) {
        id -> Int4,
        path -> Text,
        platform_id -> Nullable<Int4>,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        deleted_at -> Nullable<Timestamptz>,
        is_deleted -> Bool,
        default_file_id -> Nullable<Int4>,
        storage_type -> Int4,
        third_party -> Bool,
        steam_app_id -> Nullable<Int8>,
    }
}

diesel::table! {
    local_emulator_configs (id) {
        id -> Int4,
        emulator_id -> Int4,
        client_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        executable_path -> Text,
        nickname -> Nullable<Text>,
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
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    platforms (id) {
        id -> Int4,
        path -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
        deleted_at -> Nullable<Timestamptz>,
        is_deleted -> Bool,
        third_party -> Bool,
    }
}

diesel::table! {
    similar_game_maps (game_id, similar_game_id) {
        game_id -> Int4,
        similar_game_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::joinable!(default_emulator_profiles -> clients (client_id));
diesel::joinable!(default_emulator_profiles -> emulator_profiles (emulator_profile_id));
diesel::joinable!(default_emulator_profiles -> platforms (platform_id));
diesel::joinable!(emulator_profiles -> emulators (emulator_id));
diesel::joinable!(game_genre_maps -> game_genres (genre_id));
diesel::joinable!(game_genre_maps -> games (game_id));
diesel::joinable!(game_metadata -> games (game_id));
diesel::joinable!(games -> platforms (platform_id));
diesel::joinable!(local_emulator_configs -> clients (client_id));
diesel::joinable!(local_emulator_configs -> emulators (emulator_id));
diesel::joinable!(platform_metadata -> platforms (platform_id));

diesel::allow_tables_to_appear_in_same_query!(
    clients,
    default_emulator_profiles,
    emulator_profiles,
    emulators,
    game_files,
    game_genre_maps,
    game_genres,
    game_metadata,
    games,
    local_emulator_configs,
    platform_metadata,
    platforms,
    similar_game_maps,
);
