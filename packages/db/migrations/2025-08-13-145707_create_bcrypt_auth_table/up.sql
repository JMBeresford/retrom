-- Your SQL goes here
CREATE TABLE auth.auth_method_password_bcrypt (
    user_id INTEGER PRIMARY KEY,
    password_hash TEXT NOT NULL,
    work_factor INTEGER,
    FOREIGN KEY (user_id) REFERENCES auth.users(user_id)
        ON DELETE CASCADE
);
