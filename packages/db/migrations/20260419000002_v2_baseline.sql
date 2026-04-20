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

CREATE TABLE IF NOT EXISTS metadata_providers (
    id         TEXT    NOT NULL PRIMARY KEY,
    name       TEXT    NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT metadata_providers_name_unique UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS libraries (
    id                   TEXT NOT NULL PRIMARY KEY,
    name                 TEXT NOT NULL,
    structure_definition TEXT NOT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS root_directories (
    id         TEXT NOT NULL PRIMARY KEY,
    path       TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT root_directories_path_unique UNIQUE (path)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Core entity tables
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platforms (
    id           TEXT    NOT NULL PRIMARY KEY,
    path         TEXT    NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at   TIMESTAMP,
    is_deleted   INTEGER NOT NULL DEFAULT 0,
    third_party  INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT platforms_path_unique UNIQUE (path)
);

CREATE TABLE IF NOT EXISTS games (
    id              TEXT NOT NULL PRIMARY KEY,
    path            TEXT NOT NULL,
    platform_id     TEXT REFERENCES platforms(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    storage_type    INTEGER NOT NULL DEFAULT 1,
    third_party     INTEGER NOT NULL DEFAULT 0,
    steam_app_id    TEXT,
    default_file_id TEXT,
    CONSTRAINT games_path_unique UNIQUE (path)
);

CREATE TABLE IF NOT EXISTS game_files (
    id         TEXT    NOT NULL PRIMARY KEY,
    byte_size  INTEGER NOT NULL,
    path       TEXT    NOT NULL,
    game_id    TEXT    NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT game_files_path_unique UNIQUE (path)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Metadata tables
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS platform_metadata (
    platform_id    TEXT NOT NULL PRIMARY KEY REFERENCES platforms(id) ON DELETE CASCADE,
    name           TEXT,
    description    TEXT,
    background_url TEXT,
    logo_url       TEXT,
    igdb_id        TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    provider_id    TEXT REFERENCES metadata_providers(id),
    icon_url       TEXT
);

CREATE TABLE IF NOT EXISTS game_metadata (
    game_id        TEXT NOT NULL PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
    name           TEXT,
    description    TEXT,
    cover_url      TEXT,
    background_url TEXT,
    icon_url       TEXT,
    igdb_id        TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    release_date   TIMESTAMP,
    last_played    TIMESTAMP,
    minutes_played INTEGER,
    logo_url       TEXT,
    provider_id    TEXT REFERENCES metadata_providers(id)
);

-- Relational replacements for the v1 array columns on game_metadata
CREATE TABLE IF NOT EXISTS game_metadata_links (
    game_id TEXT NOT NULL REFERENCES game_metadata(game_id) ON DELETE CASCADE,
    url     TEXT NOT NULL,
    PRIMARY KEY (game_id, url)
);

CREATE TABLE IF NOT EXISTS game_metadata_videos (
    game_id TEXT NOT NULL REFERENCES game_metadata(game_id) ON DELETE CASCADE,
    url     TEXT NOT NULL,
    PRIMARY KEY (game_id, url)
);

CREATE TABLE IF NOT EXISTS game_metadata_screenshots (
    game_id TEXT NOT NULL REFERENCES game_metadata(game_id) ON DELETE CASCADE,
    url     TEXT NOT NULL,
    PRIMARY KEY (game_id, url)
);

CREATE TABLE IF NOT EXISTS game_metadata_artwork (
    game_id TEXT NOT NULL REFERENCES game_metadata(game_id) ON DELETE CASCADE,
    url     TEXT NOT NULL,
    PRIMARY KEY (game_id, url)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Genre / tag tables
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS game_genres (
    id         TEXT NOT NULL PRIMARY KEY,
    slug       TEXT NOT NULL,
    name       TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT game_genres_slug_name_unique UNIQUE (slug, name)
);

CREATE TABLE IF NOT EXISTS game_genre_maps (
    game_id    TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    genre_id   TEXT NOT NULL REFERENCES game_genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, genre_id)
);

CREATE TABLE IF NOT EXISTS similar_game_maps (
    game_id         TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    similar_game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, similar_game_id),
    CONSTRAINT similar_game_maps_distinct_ids CHECK (game_id != similar_game_id)
);

CREATE TABLE IF NOT EXISTS tag_domains (
    id           TEXT    NOT NULL PRIMARY KEY,
    name         TEXT    NOT NULL,
    is_well_known INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tag_domains_name_unique UNIQUE (name)
);

-- Seed well-known tag domains with stable UUIDs
INSERT INTO tag_domains (id, name, is_well_known) VALUES
    ('00000000-0000-0000-0000-000000000001', 'genre',     1),
    ('00000000-0000-0000-0000-000000000002', 'favorites', 1),
    ('00000000-0000-0000-0000-000000000003', 'franchise', 1),
    ('00000000-0000-0000-0000-000000000004', 'region',    1)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS tags (
    id            TEXT NOT NULL PRIMARY KEY,
    tag_domain_id TEXT NOT NULL REFERENCES tag_domains(id) ON DELETE CASCADE,
    value         TEXT NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tags_domain_value_unique UNIQUE (tag_domain_id, value)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Client / emulator tables
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
    id         TEXT NOT NULL PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT clients_name_unique UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS emulators (
    id            TEXT    NOT NULL PRIMARY KEY,
    name          TEXT    NOT NULL,
    save_strategy INTEGER NOT NULL,
    built_in      INTEGER NOT NULL DEFAULT 0,
    libretro_name TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relational replacement for emulators.supported_platforms integer[]
CREATE TABLE IF NOT EXISTS emulator_supported_platforms (
    emulator_id TEXT NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    PRIMARY KEY (emulator_id, platform_id)
);

-- Relational replacement for emulators.operating_systems integer[]
CREATE TABLE IF NOT EXISTS emulator_operating_systems (
    emulator_id TEXT    NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    os_id       INTEGER NOT NULL,
    PRIMARY KEY (emulator_id, os_id)
);

CREATE TABLE IF NOT EXISTS emulator_profiles (
    id          TEXT    NOT NULL PRIMARY KEY,
    emulator_id TEXT    NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,
    custom_args TEXT    NOT NULL DEFAULT '',
    built_in    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relational replacement for emulator_profiles.supported_extensions text[]
CREATE TABLE IF NOT EXISTS emulator_profile_extensions (
    profile_id TEXT NOT NULL REFERENCES emulator_profiles(id) ON DELETE CASCADE,
    extension  TEXT NOT NULL,
    PRIMARY KEY (profile_id, extension)
);

CREATE TABLE IF NOT EXISTS default_emulator_profiles (
    platform_id         TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    emulator_profile_id TEXT NOT NULL REFERENCES emulator_profiles(id) ON DELETE CASCADE,
    client_id           TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (platform_id, client_id)
);

CREATE TABLE IF NOT EXISTS local_emulator_configs (
    id                    TEXT NOT NULL PRIMARY KEY,
    emulator_id           TEXT NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    client_id             TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    executable_path       TEXT NOT NULL,
    nickname              TEXT,
    save_data_path        TEXT,
    save_states_path      TEXT,
    default_profile_id    TEXT REFERENCES emulator_profiles(id),
    bios_directory        TEXT,
    extra_files_directory TEXT,
    CONSTRAINT local_emulator_configs_emulator_client_unique UNIQUE (emulator_id, client_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Library / directory mapping tables
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS library_root_directory_maps (
    library_id        TEXT NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    root_directory_id TEXT NOT NULL REFERENCES root_directories(id) ON DELETE CASCADE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (library_id, root_directory_id)
);

CREATE TABLE IF NOT EXISTS platform_root_directory_maps (
    platform_id       TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    root_directory_id TEXT NOT NULL REFERENCES root_directories(id) ON DELETE CASCADE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (platform_id, root_directory_id)
);

CREATE TABLE IF NOT EXISTS game_root_directory_maps (
    game_id           TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    root_directory_id TEXT NOT NULL REFERENCES root_directories(id) ON DELETE CASCADE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, root_directory_id)
);

CREATE TABLE IF NOT EXISTS library_platform_maps (
    library_id  TEXT NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (library_id, platform_id)
);

CREATE TABLE IF NOT EXISTS game_platform_maps (
    game_id     TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, platform_id)
);

CREATE TABLE IF NOT EXISTS platform_tag_maps (
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    tag_id      TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (platform_id, tag_id)
);

CREATE TABLE IF NOT EXISTS game_tag_maps (
    game_id    TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    tag_id     TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, tag_id)
);

CREATE TABLE IF NOT EXISTS emulator_platform_maps (
    emulator_id TEXT NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (emulator_id, platform_id)
);

-- ────────────────────────────────────────────────────────────────────────────
-- Seed built-in emulators (stable UUIDs so v1_compat can reference them)
-- UUID scheme:
--   emulator  → 00000000-0000-0000-0001-<12-hex>
--   profile   → 00000000-0000-0000-0002-<12-hex> (same index)
-- All built-ins: os_id = 3, save_strategy = 1, custom_args = '{file}'
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO emulators (id, name, libretro_name, built_in, save_strategy) VALUES
    ('00000000-0000-0000-0001-000000000001', 'mGBA',                          'mgba',              1, 1),
    ('00000000-0000-0000-0001-000000000002', 'Atari 5200',                    'a5200',             1, 1),
    ('00000000-0000-0000-0001-000000000003', 'Beetle VB',                     'beetle_vb',         1, 1),
    ('00000000-0000-0000-0001-000000000004', 'MelonDS',                       'melonds',           1, 1),
    ('00000000-0000-0000-0001-000000000005', 'DeSmuME',                       'desmume',           1, 1),
    ('00000000-0000-0000-0001-000000000006', 'DeSmeME 2015',                  'desmume2015',       1, 1),
    ('00000000-0000-0000-0001-000000000007', 'FinalBurn Neo',                 'fbneo',             1, 1),
    ('00000000-0000-0000-0001-000000000008', 'FinalBurn Alpha 2012 - CPS1',   'fbalpha2012_cps1',  1, 1),
    ('00000000-0000-0000-0001-000000000009', 'FinalBurn Alpha 2012 - CPS2',   'fbalpha2012_cps2',  1, 1),
    ('00000000-0000-0000-0001-00000000000a', 'FCEUmm',                        'fceumm',            1, 1),
    ('00000000-0000-0000-0001-00000000000b', 'Nestopia',                      'nestopia',          1, 1),
    ('00000000-0000-0000-0001-00000000000c', 'Gambatte',                      'gambatte',          1, 1),
    ('00000000-0000-0000-0001-00000000000d', 'Gearcoleco',                    'gearcoleco',        1, 1),
    ('00000000-0000-0000-0001-00000000000e', 'SMSPlus',                       'smsplus',           1, 1),
    ('00000000-0000-0000-0001-00000000000f', 'Genesis Plus GX',               'genesis_plus_gx',  1, 1),
    ('00000000-0000-0000-0001-000000000010', 'PicoDrive',                     'picodrive',         1, 1),
    ('00000000-0000-0000-0001-000000000011', 'Handy',                         'handy',             1, 1),
    ('00000000-0000-0000-0001-000000000012', 'MAME 2003-Plus',                'mame2003_plus',     1, 1),
    ('00000000-0000-0000-0001-000000000013', 'MAME 2003',                     'mame2003',          1, 1),
    ('00000000-0000-0000-0001-000000000014', 'Mednafen - Neo Geo Pocket',     'mednafen_ngp',      1, 1),
    ('00000000-0000-0000-0001-000000000015', 'Mednafen - PC Engine',          'mednafen_pce',      1, 1),
    ('00000000-0000-0000-0001-000000000016', 'Mednafen - PCFX',               'mednafen_pcfx',     1, 1),
    ('00000000-0000-0000-0001-000000000017', 'PCSX ReARMed',                  'pcsx_rearmed',      1, 1),
    ('00000000-0000-0000-0001-000000000018', 'Mednafen - Playstation',        'mednafen_psx_hw',   1, 1),
    ('00000000-0000-0000-0001-000000000019', 'Mednafen - WonderSwan',         'mednafen_wswan',    1, 1),
    ('00000000-0000-0000-0001-00000000001a', 'Mupen64Plus Next',              'mupen64plus_next',  1, 1),
    ('00000000-0000-0000-0001-00000000001b', 'ParaLLEl N64',                  'parallel_n64',      1, 1),
    ('00000000-0000-0000-0001-00000000001c', 'opera',                         'opera',             1, 1),
    ('00000000-0000-0000-0001-00000000001d', 'PPSSPP',                        'ppsspp',            1, 1),
    ('00000000-0000-0000-0001-00000000001e', 'ProSystem',                     'prosystem',         1, 1),
    ('00000000-0000-0000-0001-00000000001f', 'Snes9x',                        'snes9x',            1, 1),
    ('00000000-0000-0000-0001-000000000020', 'Stella2014',                    'stella2014',        1, 1),
    ('00000000-0000-0000-0001-000000000021', 'Virtual Jaguar',                'virtualjaguar',     1, 1),
    ('00000000-0000-0000-0001-000000000022', 'Yabause',                       'yabause',           1, 1),
    ('00000000-0000-0000-0001-000000000023', 'PUAE',                          'puae',              1, 1),
    ('00000000-0000-0000-0001-000000000024', 'Vice x64sc',                    'vice_x64sc',        1, 1),
    ('00000000-0000-0000-0001-000000000025', 'Vice x128',                     'vice_x128',         1, 1),
    ('00000000-0000-0000-0001-000000000026', 'Vice xPET',                     'vice_xpet',         1, 1),
    ('00000000-0000-0000-0001-000000000027', 'Vice xPlus4',                   'vice_xplus4',       1, 1),
    ('00000000-0000-0000-0001-000000000028', 'Vice xVIC',                     'vice_xvic',         1, 1),
    ('00000000-0000-0000-0001-000000000029', 'SAME CDI',                      'same_cdi',          1, 1),
    ('00000000-0000-0000-0001-00000000002a', 'DOSBox Pure',                   'dosbox_pure',       1, 1)
ON CONFLICT DO NOTHING;

INSERT INTO emulator_operating_systems (emulator_id, os_id) VALUES
    ('00000000-0000-0000-0001-000000000001', 3),
    ('00000000-0000-0000-0001-000000000002', 3),
    ('00000000-0000-0000-0001-000000000003', 3),
    ('00000000-0000-0000-0001-000000000004', 3),
    ('00000000-0000-0000-0001-000000000005', 3),
    ('00000000-0000-0000-0001-000000000006', 3),
    ('00000000-0000-0000-0001-000000000007', 3),
    ('00000000-0000-0000-0001-000000000008', 3),
    ('00000000-0000-0000-0001-000000000009', 3),
    ('00000000-0000-0000-0001-00000000000a', 3),
    ('00000000-0000-0000-0001-00000000000b', 3),
    ('00000000-0000-0000-0001-00000000000c', 3),
    ('00000000-0000-0000-0001-00000000000d', 3),
    ('00000000-0000-0000-0001-00000000000e', 3),
    ('00000000-0000-0000-0001-00000000000f', 3),
    ('00000000-0000-0000-0001-000000000010', 3),
    ('00000000-0000-0000-0001-000000000011', 3),
    ('00000000-0000-0000-0001-000000000012', 3),
    ('00000000-0000-0000-0001-000000000013', 3),
    ('00000000-0000-0000-0001-000000000014', 3),
    ('00000000-0000-0000-0001-000000000015', 3),
    ('00000000-0000-0000-0001-000000000016', 3),
    ('00000000-0000-0000-0001-000000000017', 3),
    ('00000000-0000-0000-0001-000000000018', 3),
    ('00000000-0000-0000-0001-000000000019', 3),
    ('00000000-0000-0000-0001-00000000001a', 3),
    ('00000000-0000-0000-0001-00000000001b', 3),
    ('00000000-0000-0000-0001-00000000001c', 3),
    ('00000000-0000-0000-0001-00000000001d', 3),
    ('00000000-0000-0000-0001-00000000001e', 3),
    ('00000000-0000-0000-0001-00000000001f', 3),
    ('00000000-0000-0000-0001-000000000020', 3),
    ('00000000-0000-0000-0001-000000000021', 3),
    ('00000000-0000-0000-0001-000000000022', 3),
    ('00000000-0000-0000-0001-000000000023', 3),
    ('00000000-0000-0000-0001-000000000024', 3),
    ('00000000-0000-0000-0001-000000000025', 3),
    ('00000000-0000-0000-0001-000000000026', 3),
    ('00000000-0000-0000-0001-000000000027', 3),
    ('00000000-0000-0000-0001-000000000028', 3),
    ('00000000-0000-0000-0001-000000000029', 3),
    ('00000000-0000-0000-0001-00000000002a', 3)
ON CONFLICT DO NOTHING;

INSERT INTO emulator_profiles (id, emulator_id, name, built_in, custom_args) VALUES
    ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000006', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000007', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000008', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000009', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000000a', '00000000-0000-0000-0001-00000000000a', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000000b', '00000000-0000-0000-0001-00000000000b', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000000c', '00000000-0000-0000-0001-00000000000c', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000000d', '00000000-0000-0000-0001-00000000000d', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000000e', '00000000-0000-0000-0001-00000000000e', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000000f', '00000000-0000-0000-0001-00000000000f', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000010', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000011', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000012', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000013', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000014', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000015', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000016', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000017', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000018', '00000000-0000-0000-0001-000000000018', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000019', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000001a', '00000000-0000-0000-0001-00000000001a', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000001b', '00000000-0000-0000-0001-00000000001b', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000001c', '00000000-0000-0000-0001-00000000001c', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000001d', '00000000-0000-0000-0001-00000000001d', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000001e', '00000000-0000-0000-0001-00000000001e', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000001f', '00000000-0000-0000-0001-00000000001f', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000020', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000021', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000022', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000023', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000024', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000025', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000026', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000027', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0001-000000000028', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-000000000029', '00000000-0000-0000-0001-000000000029', 'Default', 1, '{file}'),
    ('00000000-0000-0000-0002-00000000002a', '00000000-0000-0000-0001-00000000002a', 'Default', 1, '{file}')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- Performance indexes
-- ────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_game_files_game_id             ON game_files(game_id);
CREATE INDEX IF NOT EXISTS idx_games_platform_id              ON games(platform_id);
CREATE INDEX IF NOT EXISTS idx_game_files_is_deleted          ON game_files(is_deleted);
CREATE INDEX IF NOT EXISTS idx_games_is_deleted               ON games(is_deleted);
CREATE INDEX IF NOT EXISTS idx_game_files_game_id_is_deleted  ON game_files(game_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_game_metadata_igdb_id          ON game_metadata(igdb_id);
CREATE INDEX IF NOT EXISTS idx_platform_metadata_igdb_id      ON platform_metadata(igdb_id);
CREATE INDEX IF NOT EXISTS idx_games_steam_app_id             ON games(steam_app_id);
CREATE INDEX IF NOT EXISTS idx_game_genre_maps_game_id        ON game_genre_maps(game_id);
CREATE INDEX IF NOT EXISTS idx_similar_game_maps_game_id      ON similar_game_maps(game_id);
