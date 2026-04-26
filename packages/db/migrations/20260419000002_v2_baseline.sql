-- 20260419000002_v2_baseline.sql
-- Complete DB-agnostic v2 schema.
-- Uses TEXT PRIMARY KEY (application-generated UUIDs), TIMESTAMP columns (no
-- time-zone suffix), and relational tables instead of PostgreSQL array columns.
-- Compatible with both PostgreSQL and SQLite.
-- On existing databases this migration runs after v1_rename has moved the old
-- tables aside, so all CREATE TABLE statements use IF NOT EXISTS as a safety net.

-- ────────────────────────────────────────────────────────────────────────────
-- Structural / support tables (no foreign keys from these to other new tables)
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists metadata_providers (
    id text not null primary key,
    name text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    constraint metadata_providers_name_unique unique (name)
);

create table if not exists libraries (
    id text not null primary key,
    name text not null,
    structure_definition text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
);

create table if not exists root_directories (
    id text not null primary key,
    path text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    constraint root_directories_path_unique unique (path)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Core entity tables
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists platforms (
    id text not null primary key,
    path text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    deleted_at text,
    is_deleted integer not null default 0,
    third_party integer not null default 0,
    constraint platforms_path_unique unique (path)
);

create table if not exists games (
    id text not null primary key,
    path text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    deleted_at text,
    is_deleted integer not null default 0,
    storage_type integer not null default 1,
    third_party integer not null default 0,
    steam_app_id text,
    constraint games_path_unique unique (path)
);

create table if not exists game_files (
    id text not null primary key,
    byte_size integer not null,
    path text not null,
    game_id text not null references games (id) on delete cascade,
    platform_id text not null references platforms (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    deleted_at text,
    is_deleted integer not null default 0,
    constraint game_files_path_unique unique (path)
);

create table if not exists default_game_files (
    game_id text not null references games (id) on delete cascade,
    platform_id text not null references platforms (id) on delete cascade,
    game_file_id text not null references game_files (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (game_id, platform_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Metadata tables
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists platform_metadata (
    platform_id text not null primary key references platforms (id) on delete cascade,
    name text,
    description text,
    background_url text,
    logo_url text,
    igdb_id text,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    provider_id text references metadata_providers (id),
    icon_url text
);

create table if not exists game_metadata (
    game_id text not null primary key references games (id) on delete cascade,
    name text,
    description text,
    cover_url text,
    background_url text,
    icon_url text,
    igdb_id text,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    release_date text,
    last_played text,
    minutes_played integer,
    logo_url text,
    provider_id text references metadata_providers (id)
);

-- Relational replacements for the v1 array columns on game_metadata
create table if not exists game_metadata_links (
    game_id text not null references game_metadata (game_id) on delete cascade,
    url text not null,
    primary key (game_id, url)
);

create table if not exists game_metadata_videos (
    game_id text not null references game_metadata (game_id) on delete cascade,
    url text not null,
    primary key (game_id, url)
);

create table if not exists game_metadata_screenshots (
    game_id text not null references game_metadata (game_id) on delete cascade,
    url text not null,
    primary key (game_id, url)
);

create table if not exists game_metadata_artwork (
    game_id text not null references game_metadata (game_id) on delete cascade,
    url text not null,
    primary key (game_id, url)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Tag tables (genres are represented as tags in the 'genre' domain)
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists similar_games (
    game_id text not null references games (id) on delete cascade,
    similar_game_id text not null references games (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (game_id, similar_game_id),
    constraint similar_games_distinct_ids check (game_id != similar_game_id)
);

create table if not exists tag_domains (
    id text not null primary key,
    name text not null,
    is_well_known integer not null default 0,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    constraint tag_domains_name_unique unique (name)
);

-- Seed well-known tag domains with stable UUIDs
insert into tag_domains (id, name, is_well_known) values
('00000000-0000-0000-0000-000000000001', 'genre', 1),
('00000000-0000-0000-0000-000000000002', 'favorites', 1),
('00000000-0000-0000-0000-000000000003', 'franchise', 1),
('00000000-0000-0000-0000-000000000004', 'region', 1)
on conflict do nothing;

create table if not exists tags (
    id text not null primary key,
    tag_domain_id text not null references tag_domains (id) on delete cascade,
    value text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    constraint tags_domain_value_unique unique (tag_domain_id, value)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Client / emulator tables
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists clients (
    id text not null primary key,
    name text not null,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    constraint clients_name_unique unique (name)
);

create table if not exists operating_systems (
    id text not null primary key,
    name text not null,
    constraint operating_systems_name_unique unique (name)
);

insert into operating_systems (id, name) values
('00000000-0000-0000-0003-000000000001', 'Windows'),
('00000000-0000-0000-0003-000000000002', 'MacOS'),
('00000000-0000-0000-0003-000000000003', 'Linux'),
('00000000-0000-0000-0003-000000000004', 'Web')
on conflict do nothing;

create table if not exists emulators (
    id text not null primary key,
    name text not null,
    save_strategy integer not null,
    built_in integer not null default 0,
    libretro_name text,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
);

-- Relational replacement for emulators.supported_platforms integer[]
create table if not exists emulator_supported_platforms (
    emulator_id text not null references emulators (id) on delete cascade,
    platform_id text not null references platforms (id) on delete cascade,
    primary key (emulator_id, platform_id)
);

-- Relational replacement for emulators.operating_systems integer[]
create table if not exists emulator_operating_systems (
    emulator_id text not null references emulators (id) on delete cascade,
    os_id text not null references operating_systems (id) on delete cascade,
    primary key (emulator_id, os_id)
);

create table if not exists emulator_profiles (
    id text not null primary key,
    emulator_id text not null references emulators (id) on delete cascade,
    name text not null,
    custom_args text not null default '',
    built_in integer not null default 0,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
);

-- Relational replacement for emulator_profiles.supported_extensions text[]
create table if not exists emulator_profile_extensions (
    profile_id text not null references emulator_profiles (id) on delete cascade,
    extension text not null,
    primary key (profile_id, extension)
);

create table if not exists default_emulator_profiles (
    platform_id text not null references platforms (id) on delete cascade,
    emulator_profile_id text not null references emulator_profiles (id) on delete cascade,
    client_id text not null references clients (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (platform_id, client_id)
);

create table if not exists local_emulator_configs (
    id text not null primary key,
    emulator_id text not null references emulators (id) on delete cascade,
    client_id text not null references clients (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    executable_path text not null,
    nickname text,
    save_data_path text,
    save_states_path text,
    default_profile_id text references emulator_profiles (id),
    bios_directory text,
    extra_files_directory text,
    constraint local_emulator_configs_emulator_client_unique unique (emulator_id, client_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Library / directory mapping tables
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists library_root_directory (
    library_id text not null references libraries (id) on delete cascade,
    root_directory_id text not null references root_directories (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (library_id, root_directory_id)
);

create table if not exists platform_root_directory (
    platform_id text not null references platforms (id) on delete cascade,
    root_directory_id text not null references root_directories (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (platform_id, root_directory_id)
);

create table if not exists game_root_directory (
    game_id text not null references games (id) on delete cascade,
    root_directory_id text not null references root_directories (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (game_id, root_directory_id)
);

create table if not exists platform_library (
    platform_id text not null references platforms (id) on delete cascade,
    library_id text not null references libraries (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (platform_id, library_id)
);

create table if not exists game_platform (
    game_id text not null references games (id) on delete cascade,
    platform_id text not null references platforms (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (game_id, platform_id)
);

create table if not exists platform_tag (
    platform_id text not null references platforms (id) on delete cascade,
    tag_id text not null references tags (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (platform_id, tag_id)
);

create table if not exists game_tag (
    game_id text not null references games (id) on delete cascade,
    tag_id text not null references tags (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (game_id, tag_id)
);

create table if not exists emulator_platform (
    emulator_id text not null references emulators (id) on delete cascade,
    platform_id text not null references platforms (id) on delete cascade,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    primary key (emulator_id, platform_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Seed built-in emulators (stable UUIDs so v1_compat can reference them)
-- UUID scheme:
--   emulator  → 00000000-0000-0000-0001-<12-hex>
--   profile   → 00000000-0000-0000-0002-<12-hex> (same index)
--   os        → 00000000-0000-0000-0003-<12-hex>
-- All built-ins: os = Web (WASM), save_strategy = 1, custom_args = '{file}'
-- ────────────────────────────────────────────────────────────────────────────

insert into emulators (id, name, libretro_name, built_in, save_strategy) values
('00000000-0000-0000-0001-000000000001', 'mGBA', 'mgba', 1, 1),
('00000000-0000-0000-0001-000000000002', 'Atari 5200', 'a5200', 1, 1),
('00000000-0000-0000-0001-000000000003', 'Beetle VB', 'beetle_vb', 1, 1),
('00000000-0000-0000-0001-000000000004', 'MelonDS', 'melonds', 1, 1),
('00000000-0000-0000-0001-000000000005', 'DeSmuME', 'desmume', 1, 1),
('00000000-0000-0000-0001-000000000006', 'DeSmeME 2015', 'desmume2015', 1, 1),
('00000000-0000-0000-0001-000000000007', 'FinalBurn Neo', 'fbneo', 1, 1),
('00000000-0000-0000-0001-000000000008', 'FinalBurn Alpha 2012 - CPS1', 'fbalpha2012_cps1', 1, 1),
('00000000-0000-0000-0001-000000000009', 'FinalBurn Alpha 2012 - CPS2', 'fbalpha2012_cps2', 1, 1),
('00000000-0000-0000-0001-00000000000a', 'FCEUmm', 'fceumm', 1, 1),
('00000000-0000-0000-0001-00000000000b', 'Nestopia', 'nestopia', 1, 1),
('00000000-0000-0000-0001-00000000000c', 'Gambatte', 'gambatte', 1, 1),
('00000000-0000-0000-0001-00000000000d', 'Gearcoleco', 'gearcoleco', 1, 1),
('00000000-0000-0000-0001-00000000000e', 'SMSPlus', 'smsplus', 1, 1),
('00000000-0000-0000-0001-00000000000f', 'Genesis Plus GX', 'genesis_plus_gx', 1, 1),
('00000000-0000-0000-0001-000000000010', 'PicoDrive', 'picodrive', 1, 1),
('00000000-0000-0000-0001-000000000011', 'Handy', 'handy', 1, 1),
('00000000-0000-0000-0001-000000000012', 'MAME 2003-Plus', 'mame2003_plus', 1, 1),
('00000000-0000-0000-0001-000000000013', 'MAME 2003', 'mame2003', 1, 1),
('00000000-0000-0000-0001-000000000014', 'Mednafen - Neo Geo Pocket', 'mednafen_ngp', 1, 1),
('00000000-0000-0000-0001-000000000015', 'Mednafen - PC Engine', 'mednafen_pce', 1, 1),
('00000000-0000-0000-0001-000000000016', 'Mednafen - PCFX', 'mednafen_pcfx', 1, 1),
('00000000-0000-0000-0001-000000000017', 'PCSX ReARMed', 'pcsx_rearmed', 1, 1),
('00000000-0000-0000-0001-000000000018', 'Mednafen - Playstation', 'mednafen_psx_hw', 1, 1),
('00000000-0000-0000-0001-000000000019', 'Mednafen - WonderSwan', 'mednafen_wswan', 1, 1),
('00000000-0000-0000-0001-00000000001a', 'Mupen64Plus Next', 'mupen64plus_next', 1, 1),
('00000000-0000-0000-0001-00000000001b', 'ParaLLEl N64', 'parallel_n64', 1, 1),
('00000000-0000-0000-0001-00000000001c', 'opera', 'opera', 1, 1),
('00000000-0000-0000-0001-00000000001d', 'PPSSPP', 'ppsspp', 1, 1),
('00000000-0000-0000-0001-00000000001e', 'ProSystem', 'prosystem', 1, 1),
('00000000-0000-0000-0001-00000000001f', 'Snes9x', 'snes9x', 1, 1),
('00000000-0000-0000-0001-000000000020', 'Stella2014', 'stella2014', 1, 1),
('00000000-0000-0000-0001-000000000021', 'Virtual Jaguar', 'virtualjaguar', 1, 1),
('00000000-0000-0000-0001-000000000022', 'Yabause', 'yabause', 1, 1),
('00000000-0000-0000-0001-000000000023', 'PUAE', 'puae', 1, 1),
('00000000-0000-0000-0001-000000000024', 'Vice x64sc', 'vice_x64sc', 1, 1),
('00000000-0000-0000-0001-000000000025', 'Vice x128', 'vice_x128', 1, 1),
('00000000-0000-0000-0001-000000000026', 'Vice xPET', 'vice_xpet', 1, 1),
('00000000-0000-0000-0001-000000000027', 'Vice xPlus4', 'vice_xplus4', 1, 1),
('00000000-0000-0000-0001-000000000028', 'Vice xVIC', 'vice_xvic', 1, 1),
('00000000-0000-0000-0001-000000000029', 'SAME CDI', 'same_cdi', 1, 1),
('00000000-0000-0000-0001-00000000002a', 'DOSBox Pure', 'dosbox_pure', 1, 1)
on conflict do nothing;

insert into emulator_operating_systems (emulator_id, os_id) values
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000000a', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000000b', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000000c', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000000d', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000000e', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000000f', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000015', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000016', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000017', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000018', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000019', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000001a', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000001b', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000001c', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000001d', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000001e', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000001f', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000020', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000022', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000024', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000025', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000026', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000027', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000028', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-000000000029', '00000000-0000-0000-0003-000000000004'),
('00000000-0000-0000-0001-00000000002a', '00000000-0000-0000-0003-000000000004')
on conflict do nothing;

insert into emulator_profiles (id, emulator_id, name, built_in, custom_args) values
(
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000001',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0001-000000000002',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0001-000000000003',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0001-000000000004',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0001-000000000005',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0001-000000000006',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000007',
    '00000000-0000-0000-0001-000000000007',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000008',
    '00000000-0000-0000-0001-000000000008',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000009',
    '00000000-0000-0000-0001-000000000009',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000a',
    '00000000-0000-0000-0001-00000000000a',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000b',
    '00000000-0000-0000-0001-00000000000b',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000c',
    '00000000-0000-0000-0001-00000000000c',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000d',
    '00000000-0000-0000-0001-00000000000d',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000e',
    '00000000-0000-0000-0001-00000000000e',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000f',
    '00000000-0000-0000-0001-00000000000f',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000010',
    '00000000-0000-0000-0001-000000000010',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000011',
    '00000000-0000-0000-0001-000000000011',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000012',
    '00000000-0000-0000-0001-000000000012',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000013',
    '00000000-0000-0000-0001-000000000013',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000014',
    '00000000-0000-0000-0001-000000000014',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000015',
    '00000000-0000-0000-0001-000000000015',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000016',
    '00000000-0000-0000-0001-000000000016',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000017',
    '00000000-0000-0000-0001-000000000017',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000018',
    '00000000-0000-0000-0001-000000000018',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000019',
    '00000000-0000-0000-0001-000000000019',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001a',
    '00000000-0000-0000-0001-00000000001a',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001b',
    '00000000-0000-0000-0001-00000000001b',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001c',
    '00000000-0000-0000-0001-00000000001c',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001d',
    '00000000-0000-0000-0001-00000000001d',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001e',
    '00000000-0000-0000-0001-00000000001e',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001f',
    '00000000-0000-0000-0001-00000000001f',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000020',
    '00000000-0000-0000-0001-000000000020',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000021',
    '00000000-0000-0000-0001-000000000021',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000022',
    '00000000-0000-0000-0001-000000000022',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000023',
    '00000000-0000-0000-0001-000000000023',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000024',
    '00000000-0000-0000-0001-000000000024',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000025',
    '00000000-0000-0000-0001-000000000025',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000026',
    '00000000-0000-0000-0001-000000000026',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000027',
    '00000000-0000-0000-0001-000000000027',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000028',
    '00000000-0000-0000-0001-000000000028',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000029',
    '00000000-0000-0000-0001-000000000029',
    'Default',
    1,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000002a',
    '00000000-0000-0000-0001-00000000002a',
    'Default',
    1,
    '{file}'
)
on conflict do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- Performance indexes
-- ────────────────────────────────────────────────────────────────────────────

create index if not exists idx_game_files_game_id on game_files (game_id);
create index if not exists idx_game_files_platform_id on game_files (platform_id);
create index if not exists idx_game_files_is_deleted on game_files (is_deleted);
create index if not exists idx_game_files_game_id_is_deleted on game_files (game_id, is_deleted);
create index if not exists idx_default_game_files_game_id on default_game_files (game_id);
create index if not exists idx_games_is_deleted on games (is_deleted);
create index if not exists idx_game_metadata_igdb_id on game_metadata (igdb_id);
create index if not exists idx_platform_metadata_igdb_id on platform_metadata (igdb_id);
create index if not exists idx_games_steam_app_id on games (steam_app_id);
create index if not exists idx_similar_games_game_id on similar_games (game_id);
