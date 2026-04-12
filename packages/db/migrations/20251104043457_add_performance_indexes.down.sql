-- Revert database indexes added for performance optimization

DROP INDEX IF EXISTS idx_game_files_game_id;
DROP INDEX IF EXISTS idx_games_platform_id;
DROP INDEX IF EXISTS idx_game_files_is_deleted;
DROP INDEX IF EXISTS idx_games_is_deleted;
DROP INDEX IF EXISTS idx_game_files_game_id_is_deleted;
DROP INDEX IF EXISTS idx_game_metadata_igdb_id;
DROP INDEX IF EXISTS idx_platform_metadata_igdb_id;
DROP INDEX IF EXISTS idx_games_steam_app_id;
DROP INDEX IF EXISTS idx_game_genre_maps_game_id;
DROP INDEX IF EXISTS idx_similar_game_maps_game_id;
