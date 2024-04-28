// @generated automatically by Diesel CLI.

diesel::table! {
    game_files (id) {
        id -> Uuid,
        name -> Text,
        byte_size -> Int4,
        path -> Text,
        hash -> Text,
        game_id -> Uuid,
    }
}

diesel::table! {
    games (id) {
        id -> Uuid,
        name -> Text,
        path -> Text,
        platform_id -> Uuid,
    }
}

diesel::table! {
    metadata (game_id) {
        game_id -> Uuid,
        description -> Nullable<Text>,
        cover_url -> Nullable<Text>,
        background_url -> Nullable<Text>,
        icon_url -> Nullable<Text>,
        igdb_id -> Nullable<Numeric>,
    }
}

diesel::table! {
    platforms (id) {
        id -> Uuid,
        name -> Text,
        path -> Text,
    }
}

diesel::joinable!(game_files -> games (game_id));
diesel::joinable!(games -> platforms (platform_id));
diesel::joinable!(metadata -> games (game_id));

diesel::allow_tables_to_appear_in_same_query!(
    game_files,
    games,
    metadata,
    platforms,
);
