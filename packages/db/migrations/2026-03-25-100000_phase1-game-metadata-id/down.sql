alter table game_metadata drop constraint game_metadata_id_unique;
alter table game_metadata drop column id;
-- sequence is dropped automatically because it is owned by game_metadata.id
