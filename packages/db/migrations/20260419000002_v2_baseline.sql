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
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    deleted_at text,
    is_deleted integer not null default 0,
    third_party integer not null default 0
);

create table if not exists games (
    id text not null primary key,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    deleted_at text,
    is_deleted integer not null default 0,
    third_party integer not null default 0,
    steam_app_id text
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
    id text not null primary key,
    platform_id text not null references platforms (id) on delete cascade,
    provider_id text not null references metadata_providers (id) on delete cascade,
    provider_platform_id text not null,
    name text,
    description text,
    background_url text,
    logo_url text,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    icon_url text,
    constraint platform_metadata_platform_provider_unique unique (platform_id, provider_id)
);

create table if not exists game_metadata (
    id text not null primary key,
    game_id text not null references games (id) on delete cascade,
    provider_id text not null references metadata_providers (id) on delete cascade,
    provider_game_id text not null,
    name text,
    description text,
    cover_url text,
    background_url text,
    icon_url text,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    release_date text,
    last_played text,
    minutes_played integer,
    logo_url text,
    constraint game_metadata_game_provider_unique unique (game_id, provider_id)
);

-- Relational replacements for the v1 array columns on game_metadata
create table if not exists game_metadata_links (
    game_metadata_id text not null references game_metadata (id) on delete cascade,
    url text not null,
    primary key (game_metadata_id, url)
);

create table if not exists game_metadata_videos (
    game_metadata_id text not null references game_metadata (id) on delete cascade,
    url text not null,
    primary key (game_metadata_id, url)
);

create table if not exists game_metadata_screenshots (
    game_metadata_id text not null references game_metadata (id) on delete cascade,
    url text not null,
    primary key (game_metadata_id, url)
);

create table if not exists game_metadata_artwork (
    game_metadata_id text not null references game_metadata (id) on delete cascade,
    url text not null,
    primary key (game_metadata_id, url)
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
    is_well_known boolean not null default false,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    constraint tag_domains_name_unique unique (name)
);

-- Seed well-known tag domains with stable UUIDs
insert into tag_domains (id, name, is_well_known) values
('00000000-0000-0000-0000-000000000001', 'genre', true),
('00000000-0000-0000-0000-000000000002', 'favorites', true),
('00000000-0000-0000-0000-000000000003', 'franchise', true),
('00000000-0000-0000-0000-000000000004', 'region', true)
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
    built_in boolean not null default false,
    libretro_name text,
    created_at text not null default current_timestamp,
    updated_at text not null default current_timestamp
);

-- Relational replacement for emulators.supported_platforms integer[]
create table if not exists emulator_platforms (
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
    built_in boolean not null default false,
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
    client_id text not null references clients (id) on delete cascade,
    emulator_profile_id text not null references emulator_profiles (id) on delete cascade,
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

-- ────────────────────────────────────────────────────────────────────────────
-- Seed built-in emulators (stable UUIDs so v1_compat can reference them)
-- UUID scheme:
--   emulator  → 00000000-0000-0000-0001-<12-hex>
--   profile   → 00000000-0000-0000-0002-<12-hex> (same index)
--   os        → 00000000-0000-0000-0003-<12-hex>
-- All built-ins: os = Web (WASM), custom_args = '{file}'
-- ────────────────────────────────────────────────────────────────────────────

insert into emulators (id, name, libretro_name, built_in) values
('00000000-0000-0000-0001-000000000001', 'mGBA', 'mgba', true),
('00000000-0000-0000-0001-000000000002', 'Atari 5200', 'a5200', true),
('00000000-0000-0000-0001-000000000003', 'Beetle VB', 'beetle_vb', true),
('00000000-0000-0000-0001-000000000004', 'MelonDS', 'melonds', true),
('00000000-0000-0000-0001-000000000005', 'DeSmuME', 'desmume', true),
('00000000-0000-0000-0001-000000000006', 'DeSmeME 2015', 'desmume2015', true),
('00000000-0000-0000-0001-000000000007', 'FinalBurn Neo', 'fbneo', true),
('00000000-0000-0000-0001-000000000008', 'FinalBurn Alpha 2012 - CPS1', 'fbalpha2012_cps1', true),
('00000000-0000-0000-0001-000000000009', 'FinalBurn Alpha 2012 - CPS2', 'fbalpha2012_cps2', true),
('00000000-0000-0000-0001-00000000000a', 'FCEUmm', 'fceumm', true),
('00000000-0000-0000-0001-00000000000b', 'Nestopia', 'nestopia', true),
('00000000-0000-0000-0001-00000000000c', 'Gambatte', 'gambatte', true),
('00000000-0000-0000-0001-00000000000d', 'Gearcoleco', 'gearcoleco', true),
('00000000-0000-0000-0001-00000000000e', 'SMSPlus', 'smsplus', true),
('00000000-0000-0000-0001-00000000000f', 'Genesis Plus GX', 'genesis_plus_gx', true),
('00000000-0000-0000-0001-000000000010', 'PicoDrive', 'picodrive', true),
('00000000-0000-0000-0001-000000000011', 'Handy', 'handy', true),
('00000000-0000-0000-0001-000000000012', 'MAME 2003-Plus', 'mame2003_plus', true),
('00000000-0000-0000-0001-000000000013', 'MAME 2003', 'mame2003', true),
('00000000-0000-0000-0001-000000000014', 'Mednafen - Neo Geo Pocket', 'mednafen_ngp', true),
('00000000-0000-0000-0001-000000000015', 'Mednafen - PC Engine', 'mednafen_pce', true),
('00000000-0000-0000-0001-000000000016', 'Mednafen - PCFX', 'mednafen_pcfx', true),
('00000000-0000-0000-0001-000000000017', 'PCSX ReARMed', 'pcsx_rearmed', true),
('00000000-0000-0000-0001-000000000018', 'Mednafen - Playstation', 'mednafen_psx_hw', true),
('00000000-0000-0000-0001-000000000019', 'Mednafen - WonderSwan', 'mednafen_wswan', true),
('00000000-0000-0000-0001-00000000001a', 'Mupen64Plus Next', 'mupen64plus_next', true),
('00000000-0000-0000-0001-00000000001b', 'ParaLLEl N64', 'parallel_n64', true),
('00000000-0000-0000-0001-00000000001c', 'opera', 'opera', true),
('00000000-0000-0000-0001-00000000001d', 'PPSSPP', 'ppsspp', true),
('00000000-0000-0000-0001-00000000001e', 'ProSystem', 'prosystem', true),
('00000000-0000-0000-0001-00000000001f', 'Snes9x', 'snes9x', true),
('00000000-0000-0000-0001-000000000020', 'Stella2014', 'stella2014', true),
('00000000-0000-0000-0001-000000000021', 'Virtual Jaguar', 'virtualjaguar', true),
('00000000-0000-0000-0001-000000000022', 'Yabause', 'yabause', true),
('00000000-0000-0000-0001-000000000023', 'PUAE', 'puae', true),
('00000000-0000-0000-0001-000000000024', 'Vice x64sc', 'vice_x64sc', true),
('00000000-0000-0000-0001-000000000025', 'Vice x128', 'vice_x128', true),
('00000000-0000-0000-0001-000000000026', 'Vice xPET', 'vice_xpet', true),
('00000000-0000-0000-0001-000000000027', 'Vice xPlus4', 'vice_xplus4', true),
('00000000-0000-0000-0001-000000000028', 'Vice xVIC', 'vice_xvic', true),
('00000000-0000-0000-0001-000000000029', 'SAME CDI', 'same_cdi', true),
('00000000-0000-0000-0001-00000000002a', 'DOSBox Pure', 'dosbox_pure', true)
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
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0001-000000000002',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0001-000000000003',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0001-000000000004',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0001-000000000005',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0001-000000000006',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000007',
    '00000000-0000-0000-0001-000000000007',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000008',
    '00000000-0000-0000-0001-000000000008',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000009',
    '00000000-0000-0000-0001-000000000009',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000a',
    '00000000-0000-0000-0001-00000000000a',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000b',
    '00000000-0000-0000-0001-00000000000b',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000c',
    '00000000-0000-0000-0001-00000000000c',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000d',
    '00000000-0000-0000-0001-00000000000d',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000e',
    '00000000-0000-0000-0001-00000000000e',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000000f',
    '00000000-0000-0000-0001-00000000000f',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000010',
    '00000000-0000-0000-0001-000000000010',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000011',
    '00000000-0000-0000-0001-000000000011',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000012',
    '00000000-0000-0000-0001-000000000012',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000013',
    '00000000-0000-0000-0001-000000000013',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000014',
    '00000000-0000-0000-0001-000000000014',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000015',
    '00000000-0000-0000-0001-000000000015',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000016',
    '00000000-0000-0000-0001-000000000016',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000017',
    '00000000-0000-0000-0001-000000000017',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000018',
    '00000000-0000-0000-0001-000000000018',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000019',
    '00000000-0000-0000-0001-000000000019',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001a',
    '00000000-0000-0000-0001-00000000001a',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001b',
    '00000000-0000-0000-0001-00000000001b',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001c',
    '00000000-0000-0000-0001-00000000001c',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001d',
    '00000000-0000-0000-0001-00000000001d',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001e',
    '00000000-0000-0000-0001-00000000001e',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000001f',
    '00000000-0000-0000-0001-00000000001f',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000020',
    '00000000-0000-0000-0001-000000000020',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000021',
    '00000000-0000-0000-0001-000000000021',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000022',
    '00000000-0000-0000-0001-000000000022',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000023',
    '00000000-0000-0000-0001-000000000023',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000024',
    '00000000-0000-0000-0001-000000000024',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000025',
    '00000000-0000-0000-0001-000000000025',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000026',
    '00000000-0000-0000-0001-000000000026',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000027',
    '00000000-0000-0000-0001-000000000027',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000028',
    '00000000-0000-0000-0001-000000000028',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-000000000029',
    '00000000-0000-0000-0001-000000000029',
    'Default',
    true,
    '{file}'
),
(
    '00000000-0000-0000-0002-00000000002a',
    '00000000-0000-0000-0001-00000000002a',
    'Default',
    true,
    '{file}'
)
on conflict do nothing;

--  ────────────────────────────────────────────────────────────────────────────
--  Seed initial metadata providers (stable UUIDs so game_metadata can reference them)
--  ────────────────────────────────────────────────────────────────────────────

insert into metadata_providers (id, name) values
('00000000-0000-0000-0000-000000000001', 'manual'),
('00000000-0000-0000-0000-000000000002', 'igdb'),
('00000000-0000-0000-0000-000000000003', 'steam')
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
create index if not exists idx_games_steam_app_id on games (steam_app_id);
create index if not exists idx_similar_games_game_id on similar_games (game_id);
