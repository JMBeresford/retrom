CREATE TABLE auth.users (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL
);