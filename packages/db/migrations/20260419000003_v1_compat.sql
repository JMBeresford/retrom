-- 20260419000003_v1_compat.sql
-- Migrates all data from the _v1_* shadow tables (created by v1_rename) into
-- the new v2 tables (created by v2_baseline).  On fresh databases every IF
-- EXISTS guard returns false and the whole block is a no-op.
-- This file uses PL/pgSQL and is intentionally pre-marked as applied on SQLite
-- databases by the diesel_migration_bootstrap helper.

DO $$
DECLARE
    _v1_tables_present boolean;
BEGIN

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = '_v1_platforms'
  ) INTO _v1_tables_present;

  IF NOT _v1_tables_present THEN
    RETURN;
  END IF;

  -- ──────────────────────────────────────────────────────────────────────────
  -- Build integer-to-UUID mapping tables for every v1 entity that has an
  -- auto-increment integer PK.  Built-in emulators and well-known tag domains
  -- are assigned the same stable UUIDs used in v2_baseline so that user-
  -- configured references (e.g. default_emulator_profiles) remain valid.
  -- ──────────────────────────────────────────────────────────────────────────

  -- metadata_providers
  CREATE TEMP TABLE _map_metadata_providers AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_metadata_providers;

  -- libraries
  CREATE TEMP TABLE _map_libraries AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_libraries;

  -- root_directories
  CREATE TEMP TABLE _map_root_directories AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_root_directories;

  -- platforms
  CREATE TEMP TABLE _map_platforms AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_platforms;

  -- games
  CREATE TEMP TABLE _map_games AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_games;

  -- game_files
  CREATE TEMP TABLE _map_game_files AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_game_files;

  -- tag_domains – well-known rows use the stable UUIDs from v2_baseline
  CREATE TEMP TABLE _map_tag_domains AS
    SELECT
      id AS old_id,
      CASE name
        WHEN 'genre'     THEN '00000000-0000-0000-0000-000000000001'
        WHEN 'favorites' THEN '00000000-0000-0000-0000-000000000002'
        WHEN 'franchise' THEN '00000000-0000-0000-0000-000000000003'
        WHEN 'region'    THEN '00000000-0000-0000-0000-000000000004'
        ELSE gen_random_uuid()::text
      END AS new_id
    FROM _v1_tag_domains;

  -- tags
  CREATE TEMP TABLE _map_tags AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_tags;

  -- clients
  CREATE TEMP TABLE _map_clients AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_clients;

  -- emulators – built-ins use the stable UUIDs from v2_baseline
  CREATE TEMP TABLE _map_emulators AS
    SELECT
      id AS old_id,
      CASE
        WHEN built_in AND libretro_name = 'mgba'             THEN '00000000-0000-0000-0001-000000000001'
        WHEN built_in AND libretro_name = 'a5200'            THEN '00000000-0000-0000-0001-000000000002'
        WHEN built_in AND libretro_name = 'beetle_vb'        THEN '00000000-0000-0000-0001-000000000003'
        WHEN built_in AND libretro_name = 'melonds'          THEN '00000000-0000-0000-0001-000000000004'
        WHEN built_in AND libretro_name = 'desmume'          THEN '00000000-0000-0000-0001-000000000005'
        WHEN built_in AND libretro_name = 'desmume2015'      THEN '00000000-0000-0000-0001-000000000006'
        WHEN built_in AND libretro_name = 'fbneo'            THEN '00000000-0000-0000-0001-000000000007'
        WHEN built_in AND libretro_name = 'fbalpha2012_cps1' THEN '00000000-0000-0000-0001-000000000008'
        WHEN built_in AND libretro_name = 'fbalpha2012_cps2' THEN '00000000-0000-0000-0001-000000000009'
        WHEN built_in AND libretro_name = 'fceumm'           THEN '00000000-0000-0000-0001-00000000000a'
        WHEN built_in AND libretro_name = 'nestopia'         THEN '00000000-0000-0000-0001-00000000000b'
        WHEN built_in AND libretro_name = 'gambatte'         THEN '00000000-0000-0000-0001-00000000000c'
        WHEN built_in AND libretro_name = 'gearcoleco'       THEN '00000000-0000-0000-0001-00000000000d'
        WHEN built_in AND libretro_name = 'smsplus'          THEN '00000000-0000-0000-0001-00000000000e'
        WHEN built_in AND libretro_name = 'genesis_plus_gx'  THEN '00000000-0000-0000-0001-00000000000f'
        WHEN built_in AND libretro_name = 'picodrive'        THEN '00000000-0000-0000-0001-000000000010'
        WHEN built_in AND libretro_name = 'handy'            THEN '00000000-0000-0000-0001-000000000011'
        WHEN built_in AND libretro_name = 'mame2003_plus'    THEN '00000000-0000-0000-0001-000000000012'
        WHEN built_in AND libretro_name = 'mame2003'         THEN '00000000-0000-0000-0001-000000000013'
        WHEN built_in AND libretro_name = 'mednafen_ngp'     THEN '00000000-0000-0000-0001-000000000014'
        WHEN built_in AND libretro_name = 'mednafen_pce'     THEN '00000000-0000-0000-0001-000000000015'
        WHEN built_in AND libretro_name = 'mednafen_pcfx'    THEN '00000000-0000-0000-0001-000000000016'
        WHEN built_in AND libretro_name = 'pcsx_rearmed'     THEN '00000000-0000-0000-0001-000000000017'
        WHEN built_in AND libretro_name = 'mednafen_psx_hw'  THEN '00000000-0000-0000-0001-000000000018'
        WHEN built_in AND libretro_name = 'mednafen_wswan'   THEN '00000000-0000-0000-0001-000000000019'
        WHEN built_in AND libretro_name = 'mupen64plus_next' THEN '00000000-0000-0000-0001-00000000001a'
        WHEN built_in AND libretro_name = 'parallel_n64'     THEN '00000000-0000-0000-0001-00000000001b'
        WHEN built_in AND libretro_name = 'opera'            THEN '00000000-0000-0000-0001-00000000001c'
        WHEN built_in AND libretro_name = 'ppsspp'           THEN '00000000-0000-0000-0001-00000000001d'
        WHEN built_in AND libretro_name = 'prosystem'        THEN '00000000-0000-0000-0001-00000000001e'
        WHEN built_in AND libretro_name = 'snes9x'           THEN '00000000-0000-0000-0001-00000000001f'
        WHEN built_in AND libretro_name = 'stella2014'       THEN '00000000-0000-0000-0001-000000000020'
        WHEN built_in AND libretro_name = 'virtualjaguar'    THEN '00000000-0000-0000-0001-000000000021'
        WHEN built_in AND libretro_name = 'yabause'          THEN '00000000-0000-0000-0001-000000000022'
        WHEN built_in AND libretro_name = 'puae'             THEN '00000000-0000-0000-0001-000000000023'
        WHEN built_in AND libretro_name = 'vice_x64sc'       THEN '00000000-0000-0000-0001-000000000024'
        WHEN built_in AND libretro_name = 'vice_x128'        THEN '00000000-0000-0000-0001-000000000025'
        WHEN built_in AND libretro_name = 'vice_xpet'        THEN '00000000-0000-0000-0001-000000000026'
        WHEN built_in AND libretro_name = 'vice_xplus4'      THEN '00000000-0000-0000-0001-000000000027'
        WHEN built_in AND libretro_name = 'vice_xvic'        THEN '00000000-0000-0000-0001-000000000028'
        WHEN built_in AND libretro_name = 'same_cdi'         THEN '00000000-0000-0000-0001-000000000029'
        WHEN built_in AND libretro_name = 'dosbox_pure'      THEN '00000000-0000-0000-0001-00000000002a'
        ELSE gen_random_uuid()::text
      END AS new_id
    FROM _v1_emulators;

  -- emulator_profiles – built-in Default profiles use the stable UUIDs
  CREATE TEMP TABLE _map_emulator_profiles AS
    SELECT
      ep.id AS old_id,
      CASE
        WHEN ep.built_in AND em.libretro_name = 'mgba'             THEN '00000000-0000-0000-0002-000000000001'
        WHEN ep.built_in AND em.libretro_name = 'a5200'            THEN '00000000-0000-0000-0002-000000000002'
        WHEN ep.built_in AND em.libretro_name = 'beetle_vb'        THEN '00000000-0000-0000-0002-000000000003'
        WHEN ep.built_in AND em.libretro_name = 'melonds'          THEN '00000000-0000-0000-0002-000000000004'
        WHEN ep.built_in AND em.libretro_name = 'desmume'          THEN '00000000-0000-0000-0002-000000000005'
        WHEN ep.built_in AND em.libretro_name = 'desmume2015'      THEN '00000000-0000-0000-0002-000000000006'
        WHEN ep.built_in AND em.libretro_name = 'fbneo'            THEN '00000000-0000-0000-0002-000000000007'
        WHEN ep.built_in AND em.libretro_name = 'fbalpha2012_cps1' THEN '00000000-0000-0000-0002-000000000008'
        WHEN ep.built_in AND em.libretro_name = 'fbalpha2012_cps2' THEN '00000000-0000-0000-0002-000000000009'
        WHEN ep.built_in AND em.libretro_name = 'fceumm'           THEN '00000000-0000-0000-0002-00000000000a'
        WHEN ep.built_in AND em.libretro_name = 'nestopia'         THEN '00000000-0000-0000-0002-00000000000b'
        WHEN ep.built_in AND em.libretro_name = 'gambatte'         THEN '00000000-0000-0000-0002-00000000000c'
        WHEN ep.built_in AND em.libretro_name = 'gearcoleco'       THEN '00000000-0000-0000-0002-00000000000d'
        WHEN ep.built_in AND em.libretro_name = 'smsplus'          THEN '00000000-0000-0000-0002-00000000000e'
        WHEN ep.built_in AND em.libretro_name = 'genesis_plus_gx'  THEN '00000000-0000-0000-0002-00000000000f'
        WHEN ep.built_in AND em.libretro_name = 'picodrive'        THEN '00000000-0000-0000-0002-000000000010'
        WHEN ep.built_in AND em.libretro_name = 'handy'            THEN '00000000-0000-0000-0002-000000000011'
        WHEN ep.built_in AND em.libretro_name = 'mame2003_plus'    THEN '00000000-0000-0000-0002-000000000012'
        WHEN ep.built_in AND em.libretro_name = 'mame2003'         THEN '00000000-0000-0000-0002-000000000013'
        WHEN ep.built_in AND em.libretro_name = 'mednafen_ngp'     THEN '00000000-0000-0000-0002-000000000014'
        WHEN ep.built_in AND em.libretro_name = 'mednafen_pce'     THEN '00000000-0000-0000-0002-000000000015'
        WHEN ep.built_in AND em.libretro_name = 'mednafen_pcfx'    THEN '00000000-0000-0000-0002-000000000016'
        WHEN ep.built_in AND em.libretro_name = 'pcsx_rearmed'     THEN '00000000-0000-0000-0002-000000000017'
        WHEN ep.built_in AND em.libretro_name = 'mednafen_psx_hw'  THEN '00000000-0000-0000-0002-000000000018'
        WHEN ep.built_in AND em.libretro_name = 'mednafen_wswan'   THEN '00000000-0000-0000-0002-000000000019'
        WHEN ep.built_in AND em.libretro_name = 'mupen64plus_next' THEN '00000000-0000-0000-0002-00000000001a'
        WHEN ep.built_in AND em.libretro_name = 'parallel_n64'     THEN '00000000-0000-0000-0002-00000000001b'
        WHEN ep.built_in AND em.libretro_name = 'opera'            THEN '00000000-0000-0000-0002-00000000001c'
        WHEN ep.built_in AND em.libretro_name = 'ppsspp'           THEN '00000000-0000-0000-0002-00000000001d'
        WHEN ep.built_in AND em.libretro_name = 'prosystem'        THEN '00000000-0000-0000-0002-00000000001e'
        WHEN ep.built_in AND em.libretro_name = 'snes9x'           THEN '00000000-0000-0000-0002-00000000001f'
        WHEN ep.built_in AND em.libretro_name = 'stella2014'       THEN '00000000-0000-0000-0002-000000000020'
        WHEN ep.built_in AND em.libretro_name = 'virtualjaguar'    THEN '00000000-0000-0000-0002-000000000021'
        WHEN ep.built_in AND em.libretro_name = 'yabause'          THEN '00000000-0000-0000-0002-000000000022'
        WHEN ep.built_in AND em.libretro_name = 'puae'             THEN '00000000-0000-0000-0002-000000000023'
        WHEN ep.built_in AND em.libretro_name = 'vice_x64sc'       THEN '00000000-0000-0000-0002-000000000024'
        WHEN ep.built_in AND em.libretro_name = 'vice_x128'        THEN '00000000-0000-0000-0002-000000000025'
        WHEN ep.built_in AND em.libretro_name = 'vice_xpet'        THEN '00000000-0000-0000-0002-000000000026'
        WHEN ep.built_in AND em.libretro_name = 'vice_xplus4'      THEN '00000000-0000-0000-0002-000000000027'
        WHEN ep.built_in AND em.libretro_name = 'vice_xvic'        THEN '00000000-0000-0000-0002-000000000028'
        WHEN ep.built_in AND em.libretro_name = 'same_cdi'         THEN '00000000-0000-0000-0002-000000000029'
        WHEN ep.built_in AND em.libretro_name = 'dosbox_pure'      THEN '00000000-0000-0000-0002-00000000002a'
        ELSE gen_random_uuid()::text
      END AS new_id
    FROM _v1_emulator_profiles ep
    JOIN _v1_emulators em ON ep.emulator_id = em.id;

  -- local_emulator_configs
  CREATE TEMP TABLE _map_local_emulator_configs AS
    SELECT id AS old_id, gen_random_uuid()::text AS new_id
    FROM _v1_local_emulator_configs;

  -- ──────────────────────────────────────────────────────────────────────────
  -- Insert v2 rows from v1 shadow tables
  -- (ON CONFLICT DO NOTHING guards against re-runs on the same DB)
  -- ──────────────────────────────────────────────────────────────────────────

  -- metadata_providers
  INSERT INTO metadata_providers (id, name, created_at, updated_at)
  SELECT m.new_id, v.name,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_metadata_providers v
  JOIN _map_metadata_providers m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- libraries
  INSERT INTO libraries (id, name, structure_definition, created_at, updated_at)
  SELECT m.new_id, v.name, COALESCE(v.structure_definition, ''),
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_libraries v
  JOIN _map_libraries m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- root_directories
  INSERT INTO root_directories (id, path, created_at, updated_at)
  SELECT m.new_id, v.path,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_root_directories v
  JOIN _map_root_directories m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- platforms
  INSERT INTO platforms (id, path, created_at, updated_at, deleted_at, is_deleted, third_party)
  SELECT
    m.new_id, v.path,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    CASE WHEN v.deleted_at IS NOT NULL
         THEN to_char(v.deleted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
         ELSE NULL END,
    CASE WHEN v.is_deleted THEN 1 ELSE 0 END,
    CASE WHEN v.third_party THEN 1 ELSE 0 END
  FROM _v1_platforms v
  JOIN _map_platforms m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- games
  INSERT INTO games (id, path, created_at, updated_at, deleted_at,
                     is_deleted, storage_type, third_party, steam_app_id)
  SELECT
    mg.new_id, v.path,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    CASE WHEN v.deleted_at IS NOT NULL
         THEN to_char(v.deleted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
         ELSE NULL END,
    CASE WHEN v.is_deleted  THEN 1 ELSE 0 END,
    v.storage_type,
    CASE WHEN v.third_party THEN 1 ELSE 0 END,
    v.steam_app_id::text
  FROM _v1_games v
  JOIN _map_games mg ON v.id = mg.old_id
  ON CONFLICT DO NOTHING;

  -- game_files (platform_id comes from the game's v1 platform_id)
  INSERT INTO game_files (id, byte_size, path, game_id, platform_id, created_at, updated_at,
                           deleted_at, is_deleted)
  SELECT
    mf.new_id, v.byte_size, v.path,
    mg.new_id,
    mp.new_id,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    CASE WHEN v.deleted_at IS NOT NULL
         THEN to_char(v.deleted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
         ELSE NULL END,
    CASE WHEN v.is_deleted THEN 1 ELSE 0 END
  FROM _v1_game_files v
  JOIN _map_game_files mf  ON v.id         = mf.old_id
  JOIN _map_games      mg  ON v.game_id    = mg.old_id
  JOIN _v1_games       g   ON v.game_id    = g.id
  JOIN _map_platforms  mp  ON g.platform_id = mp.old_id
  ON CONFLICT DO NOTHING;

  -- default_game_files (derived from v1 games.default_file_id)
  INSERT INTO default_game_files (game_id, platform_id, game_file_id, created_at, updated_at)
  SELECT
    mg.new_id,
    mp.new_id,
    mf.new_id,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_games v
  JOIN _map_games      mg ON v.id              = mg.old_id
  JOIN _map_game_files mf ON v.default_file_id = mf.old_id
  JOIN _map_platforms  mp ON v.platform_id     = mp.old_id
  ON CONFLICT DO NOTHING;

  -- platform_metadata
  INSERT INTO platform_metadata (platform_id, name, description, background_url, logo_url,
                                  igdb_id, created_at, updated_at, provider_id, icon_url)
  SELECT
    mp.new_id, v.name, v.description, v.background_url, v.logo_url,
    v.igdb_id::text,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    mprov.new_id, v.icon_url
  FROM _v1_platform_metadata v
  JOIN _map_platforms            mp    ON v.platform_id  = mp.old_id
  LEFT JOIN _map_metadata_providers mprov ON v.provider_id = mprov.old_id
  ON CONFLICT DO NOTHING;

  -- game_metadata
  INSERT INTO game_metadata (game_id, name, description, cover_url, background_url,
                              icon_url, igdb_id, created_at, updated_at,
                              release_date, last_played, minutes_played,
                              logo_url, provider_id)
  SELECT
    mg.new_id, v.name, v.description, v.cover_url, v.background_url,
    v.icon_url, v.igdb_id::text,
    to_char(v.created_at  AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at  AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    CASE WHEN v.release_date IS NOT NULL
         THEN to_char(v.release_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
         ELSE NULL END,
    CASE WHEN v.last_played IS NOT NULL
         THEN to_char(v.last_played  AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
         ELSE NULL END,
    v.minutes_played,
    v.logo_url,
    mprov.new_id
  FROM _v1_game_metadata v
  JOIN _map_games              mg    ON v.game_id     = mg.old_id
  LEFT JOIN _map_metadata_providers mprov ON v.provider_id = mprov.old_id
  ON CONFLICT DO NOTHING;

  -- game_metadata_links (from v1 links text[])
  INSERT INTO game_metadata_links (game_id, url)
  SELECT mg.new_id, unnest(v.links)
  FROM _v1_game_metadata v
  JOIN _map_games mg ON v.game_id = mg.old_id
  WHERE array_length(v.links, 1) > 0
  ON CONFLICT DO NOTHING;

  -- game_metadata_videos (prefer phase-1 video_metadata rows; fall back to array)
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = '_v1_video_metadata') THEN
    INSERT INTO game_metadata_videos (game_id, url)
    SELECT mg.new_id, v.url
    FROM _v1_video_metadata v
    JOIN _map_games mg ON v.game_metadata_id = mg.old_id
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO game_metadata_videos (game_id, url)
    SELECT mg.new_id, unnest(v.video_urls)
    FROM _v1_game_metadata v
    JOIN _map_games mg ON v.game_id = mg.old_id
    WHERE array_length(v.video_urls, 1) > 0
    ON CONFLICT DO NOTHING;
  END IF;

  -- game_metadata_screenshots
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = '_v1_screenshot_metadata') THEN
    INSERT INTO game_metadata_screenshots (game_id, url)
    SELECT mg.new_id, v.url
    FROM _v1_screenshot_metadata v
    JOIN _map_games mg ON v.game_metadata_id = mg.old_id
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO game_metadata_screenshots (game_id, url)
    SELECT mg.new_id, unnest(v.screenshot_urls)
    FROM _v1_game_metadata v
    JOIN _map_games mg ON v.game_id = mg.old_id
    WHERE array_length(v.screenshot_urls, 1) > 0
    ON CONFLICT DO NOTHING;
  END IF;

  -- game_metadata_artwork
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = '_v1_artwork_metadata') THEN
    INSERT INTO game_metadata_artwork (game_id, url)
    SELECT mg.new_id, v.url
    FROM _v1_artwork_metadata v
    JOIN _map_games mg ON v.game_metadata_id = mg.old_id
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO game_metadata_artwork (game_id, url)
    SELECT mg.new_id, unnest(v.artwork_urls)
    FROM _v1_game_metadata v
    JOIN _map_games mg ON v.game_id = mg.old_id
    WHERE array_length(v.artwork_urls, 1) > 0
    ON CONFLICT DO NOTHING;
  END IF;

  -- Migrate legacy genres to tags in the 'genre' well-known domain.
  -- Each unique genre name becomes a tag with value = genre name.
  INSERT INTO tags (id, tag_domain_id, value, created_at, updated_at)
  SELECT
    gen_random_uuid()::text,
    '00000000-0000-0000-0000-000000000001',
    v.name,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_game_genres v
  ON CONFLICT DO NOTHING;

  -- Migrate legacy game_genre_maps to game_tag_maps.
  INSERT INTO game_tag_maps (game_id, tag_id, created_at, updated_at)
  SELECT
    mg.new_id,
    t.id,
    to_char(m.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(m.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_game_genre_maps m
  JOIN _map_games        mg ON m.game_id  = mg.old_id
  JOIN _v1_game_genres    g ON m.genre_id = g.id
  JOIN tags               t ON t.value = g.name
                            AND t.tag_domain_id = '00000000-0000-0000-0000-000000000001'
  ON CONFLICT DO NOTHING;

  -- similar_game_maps
  INSERT INTO similar_game_maps (game_id, similar_game_id, created_at, updated_at)
  SELECT mg.new_id, ms.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_similar_game_maps v
  JOIN _map_games mg ON v.game_id         = mg.old_id
  JOIN _map_games ms ON v.similar_game_id = ms.old_id
  ON CONFLICT DO NOTHING;

  -- tag_domains (well-known rows already seeded by v2_baseline – skip via DO NOTHING)
  INSERT INTO tag_domains (id, name, is_well_known, created_at, updated_at)
  SELECT m.new_id, v.name,
         CASE WHEN v.is_well_known THEN 1 ELSE 0 END,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_tag_domains v
  JOIN _map_tag_domains m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- tags
  INSERT INTO tags (id, tag_domain_id, value, created_at, updated_at)
  SELECT mt.new_id, mtd.new_id, v.value,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_tags v
  JOIN _map_tags        mt  ON v.id            = mt.old_id
  JOIN _map_tag_domains mtd ON v.tag_domain_id = mtd.old_id
  ON CONFLICT DO NOTHING;

  -- clients
  INSERT INTO clients (id, name, created_at, updated_at)
  SELECT m.new_id, v.name,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_clients v
  JOIN _map_clients m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- emulators (built-ins already seeded by v2_baseline – skip via DO NOTHING)
  INSERT INTO emulators (id, name, save_strategy, built_in, libretro_name, created_at, updated_at)
  SELECT m.new_id, v.name, v.save_strategy,
         CASE WHEN v.built_in THEN 1 ELSE 0 END,
         v.libretro_name,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_emulators v
  JOIN _map_emulators m ON v.id = m.old_id
  ON CONFLICT DO NOTHING;

  -- emulator_supported_platforms (from v1 integer array)
  INSERT INTO emulator_supported_platforms (emulator_id, platform_id)
  SELECT DISTINCT me.new_id, mp.new_id
  FROM _v1_emulators e
  JOIN _map_emulators me ON e.id = me.old_id
  JOIN unnest(e.supported_platforms) AS old_pid ON TRUE
  JOIN _map_platforms mp ON old_pid = mp.old_id
  ON CONFLICT DO NOTHING;

  -- emulator_operating_systems (from v1 integer array; built-ins already seeded)
  INSERT INTO emulator_operating_systems (emulator_id, os_id)
  SELECT DISTINCT me.new_id, unnest(e.operating_systems)
  FROM _v1_emulators e
  JOIN _map_emulators me ON e.id = me.old_id
  ON CONFLICT DO NOTHING;

  -- emulator_profiles (built-in Default profiles already seeded – skip via DO NOTHING)
  INSERT INTO emulator_profiles (id, emulator_id, name, custom_args, built_in, created_at, updated_at)
  SELECT
    mep.new_id, me.new_id, ep.name,
    array_to_string(ep.custom_args, ' '),
    CASE WHEN ep.built_in THEN 1 ELSE 0 END,
    to_char(ep.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(ep.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_emulator_profiles ep
  JOIN _map_emulator_profiles mep ON ep.id         = mep.old_id
  JOIN _map_emulators         me  ON ep.emulator_id = me.old_id
  ON CONFLICT DO NOTHING;

  -- emulator_profile_extensions (from v1 supported_extensions text[])
  INSERT INTO emulator_profile_extensions (profile_id, extension)
  SELECT DISTINCT mep.new_id, unnest(ep.supported_extensions)
  FROM _v1_emulator_profiles ep
  JOIN _map_emulator_profiles mep ON ep.id = mep.old_id
  WHERE array_length(ep.supported_extensions, 1) > 0
  ON CONFLICT DO NOTHING;

  -- default_emulator_profiles
  INSERT INTO default_emulator_profiles (platform_id, emulator_profile_id, client_id, created_at, updated_at)
  SELECT mp.new_id, mep.new_id, mc.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_default_emulator_profiles v
  JOIN _map_platforms          mp  ON v.platform_id         = mp.old_id
  JOIN _map_emulator_profiles  mep ON v.emulator_profile_id = mep.old_id
  JOIN _map_clients            mc  ON v.client_id           = mc.old_id
  ON CONFLICT DO NOTHING;

  -- local_emulator_configs
  INSERT INTO local_emulator_configs (id, emulator_id, client_id, created_at, updated_at,
                                       executable_path, nickname, save_data_path,
                                       save_states_path, default_profile_id,
                                       bios_directory, extra_files_directory)
  SELECT
    mlec.new_id, me.new_id, mc.new_id,
    to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    COALESCE(v.executable_path, ''),
    v.nickname, v.save_data_path, v.save_states_path,
    mep.new_id,
    v.bios_directory, v.extra_files_directory
  FROM _v1_local_emulator_configs v
  JOIN _map_local_emulator_configs mlec ON v.id               = mlec.old_id
  JOIN _map_emulators              me   ON v.emulator_id       = me.old_id
  JOIN _map_clients                mc   ON v.client_id         = mc.old_id
  LEFT JOIN _map_emulator_profiles mep  ON v.default_profile_id = mep.old_id
  ON CONFLICT DO NOTHING;

  -- library_root_directory_maps
  INSERT INTO library_root_directory_maps (library_id, root_directory_id, created_at, updated_at)
  SELECT ml.new_id, mr.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_library_root_directory_maps v
  JOIN _map_libraries        ml ON v.library_id        = ml.old_id
  JOIN _map_root_directories mr ON v.root_directory_id = mr.old_id
  ON CONFLICT DO NOTHING;

  -- platform_root_directory_maps
  INSERT INTO platform_root_directory_maps (platform_id, root_directory_id, created_at, updated_at)
  SELECT mp.new_id, mr.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_platform_root_directory_maps v
  JOIN _map_platforms        mp ON v.platform_id        = mp.old_id
  JOIN _map_root_directories mr ON v.root_directory_id  = mr.old_id
  ON CONFLICT DO NOTHING;

  -- game_root_directory_maps
  INSERT INTO game_root_directory_maps (game_id, root_directory_id, created_at, updated_at)
  SELECT mg.new_id, mr.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_game_root_directory_maps v
  JOIN _map_games            mg ON v.game_id           = mg.old_id
  JOIN _map_root_directories mr ON v.root_directory_id = mr.old_id
  ON CONFLICT DO NOTHING;

  -- library_platform_maps
  INSERT INTO library_platform_maps (library_id, platform_id, created_at, updated_at)
  SELECT ml.new_id, mp.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_library_platform_maps v
  JOIN _map_libraries ml ON v.library_id  = ml.old_id
  JOIN _map_platforms mp ON v.platform_id = mp.old_id
  ON CONFLICT DO NOTHING;

  -- game_platform_maps
  INSERT INTO game_platform_maps (game_id, platform_id, created_at, updated_at)
  SELECT mg.new_id, mp.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_game_platform_maps v
  JOIN _map_games    mg ON v.game_id     = mg.old_id
  JOIN _map_platforms mp ON v.platform_id = mp.old_id
  ON CONFLICT DO NOTHING;

  -- platform_tag_maps
  INSERT INTO platform_tag_maps (platform_id, tag_id, created_at, updated_at)
  SELECT mp.new_id, mt.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_platform_tag_maps v
  JOIN _map_platforms mp ON v.platform_id = mp.old_id
  JOIN _map_tags      mt ON v.tag_id      = mt.old_id
  ON CONFLICT DO NOTHING;

  -- game_tag_maps
  INSERT INTO game_tag_maps (game_id, tag_id, created_at, updated_at)
  SELECT mg.new_id, mt.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_game_tag_maps v
  JOIN _map_games mg ON v.game_id = mg.old_id
  JOIN _map_tags  mt ON v.tag_id  = mt.old_id
  ON CONFLICT DO NOTHING;

  -- emulator_platform_maps
  INSERT INTO emulator_platform_maps (emulator_id, platform_id, created_at, updated_at)
  SELECT me.new_id, mp.new_id,
         to_char(v.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
         to_char(v.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  FROM _v1_emulator_platform_maps v
  JOIN _map_emulators me ON v.emulator_id = me.old_id
  JOIN _map_platforms mp ON v.platform_id = mp.old_id
  ON CONFLICT DO NOTHING;

  -- ──────────────────────────────────────────────────────────────────────────
  -- Drop _v1_* shadow tables (reverse FK order)
  -- ──────────────────────────────────────────────────────────────────────────

  DROP TABLE IF EXISTS _v1_emulator_platform_maps;
  DROP TABLE IF EXISTS _v1_game_tag_maps;
  DROP TABLE IF EXISTS _v1_platform_tag_maps;
  DROP TABLE IF EXISTS _v1_game_platform_maps;
  DROP TABLE IF EXISTS _v1_library_platform_maps;
  DROP TABLE IF EXISTS _v1_game_root_directory_maps;
  DROP TABLE IF EXISTS _v1_platform_root_directory_maps;
  DROP TABLE IF EXISTS _v1_library_root_directory_maps;
  DROP TABLE IF EXISTS _v1_local_emulator_configs;
  DROP TABLE IF EXISTS _v1_default_emulator_profiles;
  DROP TABLE IF EXISTS _v1_emulator_profiles;
  DROP TABLE IF EXISTS _v1_emulators;
  DROP TABLE IF EXISTS _v1_clients;
  DROP TABLE IF EXISTS _v1_tags;
  DROP TABLE IF EXISTS _v1_tag_domains;
  DROP TABLE IF EXISTS _v1_artwork_metadata;
  DROP TABLE IF EXISTS _v1_screenshot_metadata;
  DROP TABLE IF EXISTS _v1_video_metadata;
  DROP TABLE IF EXISTS _v1_similar_game_maps;
  DROP TABLE IF EXISTS _v1_game_genre_maps;
  DROP TABLE IF EXISTS _v1_game_genres;
  DROP TABLE IF EXISTS _v1_game_metadata;
  DROP TABLE IF EXISTS _v1_platform_metadata;
  DROP TABLE IF EXISTS _v1_game_files;
  DROP TABLE IF EXISTS _v1_games;
  DROP TABLE IF EXISTS _v1_platforms;
  DROP TABLE IF EXISTS _v1_metadata_providers;
  DROP TABLE IF EXISTS _v1_root_directories;
  DROP TABLE IF EXISTS _v1_libraries;

  -- Drop temp mapping tables
  DROP TABLE IF EXISTS _map_local_emulator_configs;
  DROP TABLE IF EXISTS _map_emulator_profiles;
  DROP TABLE IF EXISTS _map_emulators;
  DROP TABLE IF EXISTS _map_clients;
  DROP TABLE IF EXISTS _map_tags;
  DROP TABLE IF EXISTS _map_tag_domains;
  DROP TABLE IF EXISTS _map_game_files;
  DROP TABLE IF EXISTS _map_games;
  DROP TABLE IF EXISTS _map_platforms;
  DROP TABLE IF EXISTS _map_root_directories;
  DROP TABLE IF EXISTS _map_libraries;
  DROP TABLE IF EXISTS _map_metadata_providers;

END $$;
