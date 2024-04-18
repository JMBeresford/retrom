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
    platforms (id) {
        id -> Uuid,
        name -> Text,
        path -> Text,
    }
}

diesel::joinable!(game_files -> games (game_id));
diesel::joinable!(games -> platforms (platform_id));

diesel::allow_tables_to_appear_in_same_query!(
    game_files,
    games,
    platforms,
);
