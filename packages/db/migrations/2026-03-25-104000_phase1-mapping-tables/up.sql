-- Relational mapping tables introduced in Phase 1.
-- These replace or supplement direct FK columns with proper many-to-many join tables,
-- enabling flexible assignment of directories, platforms, and tags across entities.

-- Library ↔ RootDirectory (many-to-many)
create table library_root_directory_maps (
    library_id        integer not null,
    root_directory_id integer not null,
    created_at        timestamp with time zone default current_timestamp,
    updated_at        timestamp with time zone default current_timestamp,
    constraint fk_lrdm_library_id
        foreign key (library_id) references libraries (id) on delete cascade,
    constraint fk_lrdm_root_directory_id
        foreign key (root_directory_id) references root_directories (id) on delete cascade,
    primary key (library_id, root_directory_id)
);

-- Platform ↔ RootDirectory (many-to-many)
create table platform_root_directory_maps (
    platform_id       integer not null,
    root_directory_id integer not null,
    created_at        timestamp with time zone default current_timestamp,
    updated_at        timestamp with time zone default current_timestamp,
    constraint fk_prdm_platform_id
        foreign key (platform_id) references platforms (id) on delete cascade,
    constraint fk_prdm_root_directory_id
        foreign key (root_directory_id) references root_directories (id) on delete cascade,
    primary key (platform_id, root_directory_id)
);

-- Game ↔ RootDirectory (many-to-many)
create table game_root_directory_maps (
    game_id           integer not null,
    root_directory_id integer not null,
    created_at        timestamp with time zone default current_timestamp,
    updated_at        timestamp with time zone default current_timestamp,
    constraint fk_grdm_game_id
        foreign key (game_id) references games (id) on delete cascade,
    constraint fk_grdm_root_directory_id
        foreign key (root_directory_id) references root_directories (id) on delete cascade,
    primary key (game_id, root_directory_id)
);

-- Library ↔ Platform (many-to-many)
create table library_platform_maps (
    library_id  integer not null,
    platform_id integer not null,
    created_at  timestamp with time zone default current_timestamp,
    updated_at  timestamp with time zone default current_timestamp,
    constraint fk_lpm_library_id
        foreign key (library_id) references libraries (id) on delete cascade,
    constraint fk_lpm_platform_id
        foreign key (platform_id) references platforms (id) on delete cascade,
    primary key (library_id, platform_id)
);

-- Game ↔ Platform (many-to-many).
-- The existing nullable games.platform_id FK is kept during the migration window
-- and removed in Phase 4 after data is copied into this table.
create table game_platform_maps (
    game_id     integer not null,
    platform_id integer not null,
    created_at  timestamp with time zone default current_timestamp,
    updated_at  timestamp with time zone default current_timestamp,
    constraint fk_gpm_game_id
        foreign key (game_id) references games (id) on delete cascade,
    constraint fk_gpm_platform_id
        foreign key (platform_id) references platforms (id) on delete cascade,
    primary key (game_id, platform_id)
);

-- Platform ↔ Tag (many-to-many)
create table platform_tag_maps (
    platform_id integer not null,
    tag_id      integer not null,
    created_at  timestamp with time zone default current_timestamp,
    updated_at  timestamp with time zone default current_timestamp,
    constraint fk_ptm_platform_id
        foreign key (platform_id) references platforms (id) on delete cascade,
    constraint fk_ptm_tag_id
        foreign key (tag_id) references tags (id) on delete cascade,
    primary key (platform_id, tag_id)
);

-- Game ↔ Tag (many-to-many)
create table game_tag_maps (
    game_id    integer not null,
    tag_id     integer not null,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint fk_gtm_game_id
        foreign key (game_id) references games (id) on delete cascade,
    constraint fk_gtm_tag_id
        foreign key (tag_id) references tags (id) on delete cascade,
    primary key (game_id, tag_id)
);

-- Emulator ↔ Platform (many-to-many).
-- Replaces the emulators.supported_platforms integer[] column (Phase 4 data migration).
create table emulator_platform_maps (
    emulator_id integer not null,
    platform_id integer not null,
    created_at  timestamp with time zone default current_timestamp,
    updated_at  timestamp with time zone default current_timestamp,
    constraint fk_epm_emulator_id
        foreign key (emulator_id) references emulators (id) on delete cascade,
    constraint fk_epm_platform_id
        foreign key (platform_id) references platforms (id) on delete cascade,
    primary key (emulator_id, platform_id)
);
