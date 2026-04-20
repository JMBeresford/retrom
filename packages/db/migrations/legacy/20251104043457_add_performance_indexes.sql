-- Add indexes for foreign keys to improve query performance
-- These indexes will significantly speed up JOIN operations and WHERE clauses
-- that filter on foreign key columns

-- Index for game_files.game_id (used in get_games query)
CREATE INDEX IF NOT EXISTS idx_game_files_game_id ON game_files(game_id);

-- Index for game_metadata.game_id (used in get_games query)
-- Note: game_metadata.game_id is already the primary key, so this is redundant
-- but included for completeness

-- Index for games.platform_id (used for filtering games by platform)
CREATE INDEX IF NOT EXISTS idx_games_platform_id ON games(platform_id);

-- Index for game_files.is_deleted (used for filtering deleted files)
CREATE INDEX IF NOT EXISTS idx_game_files_is_deleted ON game_files(is_deleted);

-- Index for games.is_deleted (used for filtering deleted games)
CREATE INDEX IF NOT EXISTS idx_games_is_deleted ON games(is_deleted);

-- Composite index for game_files (game_id, is_deleted) for optimal query performance
-- This covers the common query pattern: WHERE game_id = ? AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_game_files_game_id_is_deleted ON game_files(game_id, is_deleted);

-- Index for game_metadata.igdb_id (used in metadata lookups)
CREATE INDEX IF NOT EXISTS idx_game_metadata_igdb_id ON game_metadata(igdb_id);

-- Index for platform_metadata.igdb_id (used in metadata lookups)
CREATE INDEX IF NOT EXISTS idx_platform_metadata_igdb_id ON platform_metadata(igdb_id);

-- Index for games.steam_app_id (used for Steam game lookups)
CREATE INDEX IF NOT EXISTS idx_games_steam_app_id ON games(steam_app_id) WHERE steam_app_id IS NOT NULL;

-- Index for game_genre_maps.game_id (used for genre queries)
CREATE INDEX IF NOT EXISTS idx_game_genre_maps_game_id ON game_genre_maps(game_id);

-- Index for similar_game_maps.game_id (used for similar games queries)
CREATE INDEX IF NOT EXISTS idx_similar_game_maps_game_id ON similar_game_maps(game_id);
