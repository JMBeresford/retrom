// @generated automatically by Diesel CLI.

pub mod auth {
    diesel::table! {
        auth.auth_method_password_bcrypt (user_id) {
            user_id -> Int4,
            password_hash -> Text,
            work_factor -> Nullable<Int4>,
        }
    }

    diesel::table! {
        auth.users (user_id) {
            user_id -> Int4,
            username -> Text,
        }
    }

    diesel::joinable!(auth_method_password_bcrypt -> users (user_id));

    diesel::allow_tables_to_appear_in_same_query!(
        auth_method_password_bcrypt,
        users,
    );
}
