create table platforms (
    id integer primary key generated always as identity,
    path text not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    unique (path)
);

create table games (
    id integer primary key generated always as identity,
    path text not null,
    platform_id integer,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_platform_id foreign key (
        platform_id
    ) references platforms (id) on delete cascade,
    unique (path)
);

create table game_files (
    id integer primary key generated always as identity,
    byte_size bigint not null,
    path text not null,
    game_id integer not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_game_id foreign key (game_id) references games (
        id
    ) on delete cascade,
    unique (path)
);
