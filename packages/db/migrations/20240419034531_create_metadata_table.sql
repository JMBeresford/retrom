create table platform_metadata (
    platform_id integer primary key,
    name text,
    description text,
    background_url text,
    logo_url text,
    igdb_id bigint,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_platform_id foreign key (
        platform_id
    ) references platforms (id) on delete cascade,
    unique (platform_id)
);

create table game_metadata (
    game_id integer primary key,
    name text,
    description text,
    cover_url text,
    background_url text,
    icon_url text,
    igdb_id bigint,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    links text [] not null,
    video_urls text [] not null,
    screenshot_urls text [] not null,
    artwork_urls text [] not null,
    release_date timestamp with time zone,
    last_played timestamp with time zone,
    minutes_played integer,
    constraint fk_game_id foreign key (game_id) references games (
        id
    ) on delete cascade,
    unique (game_id)
);

create table game_genres (
    id integer primary key generated always as identity,
    slug text not null,
    name text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint unique_slug_name unique (slug, name)
);

create table game_genre_maps (
    game_id integer not null,
    genre_id integer not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_game_id foreign key (game_id) references games (
        id
    ) on delete cascade,
    constraint fk_genre_id foreign key (
        genre_id
    ) references game_genres (id) on delete cascade,
    primary key (game_id, genre_id)
);

create table similar_game_maps (
    game_id integer not null,
    similar_game_id integer not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_game_id foreign key (game_id) references games (
        id
    ) on delete cascade,
    constraint fk_similar_game_id foreign key (
        similar_game_id
    ) references games (id) on delete cascade,
    primary key (game_id, similar_game_id)
);
