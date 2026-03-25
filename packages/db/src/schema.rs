// @generated automatically by Diesel CLI.

diesel::table! {
    artwork_metadata (id) {
        id -> Int4,
        game_metadata_id -> Int4,
        url -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

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
    emulator_platform_maps (emulator_id, platform_id) {
        emulator_id -> Int4,
        platform_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
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
        built_in -> Bool,
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
        built_in -> Bool,
        libretro_name -> Nullable<Text>,
        operating_systems -> Array<Int4>,
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
        id -> Int4,
        provider_id -> Nullable<Int4>,
        logo_url -> Nullable<Text>,
    }
}

diesel::table! {
    game_platform_maps (game_id, platform_id) {
        game_id -> Int4,
        platform_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    game_root_directory_maps (game_id, root_directory_id) {
        game_id -> Int4,
        root_directory_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    game_tag_maps (game_id, tag_id) {
        game_id -> Int4,
        tag_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
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
    libraries (id) {
        id -> Int4,
        name -> Text,
        structure_definition -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    library_platform_maps (library_id, platform_id) {
        library_id -> Int4,
        platform_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    library_root_directory_maps (library_id, root_directory_id) {
        library_id -> Int4,
        root_directory_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
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
        save_data_path -> Nullable<Text>,
        save_states_path -> Nullable<Text>,
        default_profile_id -> Nullable<Int4>,
        bios_directory -> Nullable<Text>,
        extra_files_directory -> Nullable<Text>,
    }
}

diesel::table! {
    metadata_providers (id) {
        id -> Int4,
        name -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
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
        provider_id -> Nullable<Int4>,
        icon_url -> Nullable<Text>,
    }
}

diesel::table! {
    platform_root_directory_maps (platform_id, root_directory_id) {
        platform_id -> Int4,
        root_directory_id -> Int4,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    platform_tag_maps (platform_id, tag_id) {
        platform_id -> Int4,
        tag_id -> Int4,
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
    root_directories (id) {
        id -> Int4,
        path -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    screenshot_metadata (id) {
        id -> Int4,
        game_metadata_id -> Int4,
        url -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
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

diesel::table! {
    tag_domains (id) {
        id -> Int4,
        name -> Text,
        is_well_known -> Bool,
    }
}

diesel::table! {
    tags (id) {
        id -> Int4,
        tag_domain_id -> Int4,
        value -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    video_metadata (id) {
        id -> Int4,
        game_metadata_id -> Int4,
        url -> Text,
        created_at -> Nullable<Timestamptz>,
        updated_at -> Nullable<Timestamptz>,
    }
}

diesel::joinable!(default_emulator_profiles -> clients (client_id));
diesel::joinable!(default_emulator_profiles -> emulator_profiles (emulator_profile_id));
diesel::joinable!(default_emulator_profiles -> platforms (platform_id));
diesel::joinable!(emulator_platform_maps -> emulators (emulator_id));
diesel::joinable!(emulator_platform_maps -> platforms (platform_id));
diesel::joinable!(emulator_profiles -> emulators (emulator_id));
diesel::joinable!(game_genre_maps -> game_genres (genre_id));
diesel::joinable!(game_genre_maps -> games (game_id));
diesel::joinable!(game_metadata -> games (game_id));
diesel::joinable!(game_metadata -> metadata_providers (provider_id));
diesel::joinable!(game_platform_maps -> games (game_id));
diesel::joinable!(game_platform_maps -> platforms (platform_id));
diesel::joinable!(game_root_directory_maps -> games (game_id));
diesel::joinable!(game_root_directory_maps -> root_directories (root_directory_id));
diesel::joinable!(game_tag_maps -> games (game_id));
diesel::joinable!(game_tag_maps -> tags (tag_id));
diesel::joinable!(games -> platforms (platform_id));
diesel::joinable!(library_platform_maps -> libraries (library_id));
diesel::joinable!(library_platform_maps -> platforms (platform_id));
diesel::joinable!(library_root_directory_maps -> libraries (library_id));
diesel::joinable!(library_root_directory_maps -> root_directories (root_directory_id));
diesel::joinable!(local_emulator_configs -> clients (client_id));
diesel::joinable!(local_emulator_configs -> emulator_profiles (default_profile_id));
diesel::joinable!(local_emulator_configs -> emulators (emulator_id));
diesel::joinable!(platform_metadata -> metadata_providers (provider_id));
diesel::joinable!(platform_metadata -> platforms (platform_id));
diesel::joinable!(platform_root_directory_maps -> platforms (platform_id));
diesel::joinable!(platform_root_directory_maps -> root_directories (root_directory_id));
diesel::joinable!(platform_tag_maps -> platforms (platform_id));
diesel::joinable!(platform_tag_maps -> tags (tag_id));
diesel::joinable!(tags -> tag_domains (tag_domain_id));

diesel::allow_tables_to_appear_in_same_query!(
    artwork_metadata,
    clients,
    default_emulator_profiles,
    emulator_platform_maps,
    emulator_profiles,
    emulators,
    game_files,
    game_genre_maps,
    game_genres,
    game_metadata,
    game_platform_maps,
    game_root_directory_maps,
    game_tag_maps,
    games,
    libraries,
    library_platform_maps,
    library_root_directory_maps,
    local_emulator_configs,
    metadata_providers,
    platform_metadata,
    platform_root_directory_maps,
    platform_tag_maps,
    platforms,
    root_directories,
    screenshot_metadata,
    similar_game_maps,
    tag_domains,
    tags,
    video_metadata,
);
