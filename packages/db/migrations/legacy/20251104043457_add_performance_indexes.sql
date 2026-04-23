-- Add indexes for foreign keys to improve query performance
-- These indexes will significantly speed up JOIN operations and WHERE clauses
-- that filter on foreign key columns

-- Index for game_files.game_id (used in get_games query)
create index if not exists idx_game_files_game_id on game_files (game_id);

-- Index for game_metadata.game_id (used in get_games query)
-- Note: game_metadata.game_id is already the primary key, so this is redundant
-- but included for completeness

-- Index for games.platform_id (used for filtering games by platform)
create index if not exists idx_games_platform_id on games (platform_id);

-- Index for game_files.is_deleted (used for filtering deleted files)
create index if not exists idx_game_files_is_deleted on game_files (is_deleted);

-- Index for games.is_deleted (used for filtering deleted games)
create index if not exists idx_games_is_deleted on games (is_deleted);

-- Composite index for game_files (game_id, is_deleted) for optimal query performance
-- This covers the common query pattern: WHERE game_id = ? AND is_deleted = false
create index if not exists idx_game_files_game_id_is_deleted on game_files (game_id, is_deleted);

-- Index for game_metadata.igdb_id (used in metadata lookups)
create index if not exists idx_game_metadata_igdb_id on game_metadata (igdb_id);

-- Index for platform_metadata.igdb_id (used in metadata lookups)
create index if not exists idx_platform_metadata_igdb_id on platform_metadata (igdb_id);

-- Index for games.steam_app_id (used for Steam game lookups)
create index if not exists idx_games_steam_app_id on games (
    steam_app_id
) where steam_app_id is not null;

-- Index for game_genre_maps.game_id (used for genre queries)
create index if not exists idx_game_genre_maps_game_id on game_genre_maps (game_id);

-- Index for similar_game_maps.game_id (used for similar games queries)
create index if not exists idx_similar_game_maps_game_id on similar_game_maps (game_id);
