DELETE FROM "similar_game_maps" WHERE game_id = similar_game_id;

ALTER TABLE "similar_game_maps" ADD CONSTRAINT "distinct_ids" CHECK (game_id != similar_game_id);
