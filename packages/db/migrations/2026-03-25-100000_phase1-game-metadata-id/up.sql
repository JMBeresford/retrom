-- Add a surrogate integer id to game_metadata.
-- This column is needed before video_metadata, screenshot_metadata, and
-- artwork_metadata can reference game_metadata as a FK target.
-- game_id remains the primary key; id is a unique secondary key.

create sequence game_metadata_id_seq;

alter table game_metadata
    add column id integer not null default nextval('game_metadata_id_seq');

alter sequence game_metadata_id_seq owned by game_metadata.id;

alter table game_metadata
    add constraint game_metadata_id_unique unique (id);
