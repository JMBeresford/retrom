// @generated automatically by Diesel CLI.

pub mod auth {
    diesel::table! {
        auth.users (user_id) {
            user_id -> Int4,
            username -> Text,
        }
    }
}
