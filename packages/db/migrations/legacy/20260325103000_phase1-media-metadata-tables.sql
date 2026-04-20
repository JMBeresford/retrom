-- Relational replacements for game_metadata.{video,screenshot,artwork}_urls arrays.
-- These tables reference game_metadata via the new surrogate `id` column
-- (added in migration 2026-03-25-100000).

create table video_metadata (
    id integer primary key generated always as identity,
    game_metadata_id integer not null,
    url text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_video_metadata_game_metadata_id
        foreign key (game_metadata_id) references game_metadata (id) on delete cascade
);

create table screenshot_metadata (
    id integer primary key generated always as identity,
    game_metadata_id integer not null,
    url text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_screenshot_metadata_game_metadata_id
        foreign key (game_metadata_id) references game_metadata (id) on delete cascade
);

create table artwork_metadata (
    id integer primary key generated always as identity,
    game_metadata_id integer not null,
    url text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_artwork_metadata_game_metadata_id
        foreign key (game_metadata_id) references game_metadata (id) on delete cascade
);
