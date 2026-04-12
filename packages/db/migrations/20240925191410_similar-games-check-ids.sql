delete from similar_game_maps
where game_id = similar_game_id;

alter table similar_game_maps add constraint distinct_ids check (
    game_id != similar_game_id
);
