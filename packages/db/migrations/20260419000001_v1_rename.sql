-- 20260419000001_v1_rename.sql
-- Renames every v1 (original Diesel) table to a _v1_* shadow copy so that
-- v2_baseline can create clean v2 tables alongside them, and v1_compat can
-- drain data across.  All rename statements are guarded with IF EXISTS so the
-- migration is a no-op on fresh databases.
-- This file uses PL/pgSQL and is intentionally pre-marked as applied on SQLite
-- databases by the diesel_migration_bootstrap helper.

do $$
BEGIN

  -- Core entity tables
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'platforms') THEN
    ALTER TABLE platforms RENAME TO _v1_platforms;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'games') THEN
    ALTER TABLE games RENAME TO _v1_games;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'game_files') THEN
    ALTER TABLE game_files RENAME TO _v1_game_files;
  END IF;

  -- Metadata tables
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'platform_metadata') THEN
    ALTER TABLE platform_metadata RENAME TO _v1_platform_metadata;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'game_metadata') THEN
    ALTER TABLE game_metadata RENAME TO _v1_game_metadata;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'game_genres') THEN
    ALTER TABLE game_genres RENAME TO _v1_game_genres;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'game_genre_maps') THEN
    ALTER TABLE game_genre_maps RENAME TO _v1_game_genre_maps;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'similar_game_maps') THEN
    ALTER TABLE similar_game_maps RENAME TO _v1_similar_game_maps;
  END IF;

  -- Client / emulator tables
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'clients') THEN
    ALTER TABLE clients RENAME TO _v1_clients;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'emulators') THEN
    ALTER TABLE emulators RENAME TO _v1_emulators;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'emulator_profiles') THEN
    ALTER TABLE emulator_profiles RENAME TO _v1_emulator_profiles;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'default_emulator_profiles') THEN
    ALTER TABLE default_emulator_profiles RENAME TO _v1_default_emulator_profiles;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'local_emulator_configs') THEN
    ALTER TABLE local_emulator_configs RENAME TO _v1_local_emulator_configs;
  END IF;

END $$;
