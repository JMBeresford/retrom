-- Auto-update updated_at timestamps on row modification (SQLite).
-- SQLite has no stored functions, so one trigger is created per table.
-- The WHEN guard avoids overwriting an explicitly-supplied updated_at and
-- prevents re-triggering when recursive_triggers is enabled.

create trigger if not exists set_metadata_providers_updated_at
after update on metadata_providers
for each row
when new.updated_at = old.updated_at
begin
    update metadata_providers set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_libraries_updated_at
after update on libraries
for each row
when new.updated_at = old.updated_at
begin
    update libraries set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_root_directories_updated_at
after update on root_directories
for each row
when new.updated_at = old.updated_at
begin
    update root_directories set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_platforms_updated_at
after update on platforms
for each row
when new.updated_at = old.updated_at
begin
    update platforms set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_games_updated_at
after update on games
for each row
when new.updated_at = old.updated_at
begin
    update games set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_game_files_updated_at
after update on game_files
for each row
when new.updated_at = old.updated_at
begin
    update game_files set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_default_game_files_updated_at
after update on default_game_files
for each row
when new.updated_at = old.updated_at
begin
    update default_game_files set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_platform_metadata_updated_at
after update on platform_metadata
for each row
when new.updated_at = old.updated_at
begin
    update platform_metadata set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_game_metadata_updated_at
after update on game_metadata
for each row
when new.updated_at = old.updated_at
begin
    update game_metadata set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_similar_games_updated_at
after update on similar_games
for each row
when new.updated_at = old.updated_at
begin
    update similar_games set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_tag_domains_updated_at
after update on tag_domains
for each row
when new.updated_at = old.updated_at
begin
    update tag_domains set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_tags_updated_at
after update on tags
for each row
when new.updated_at = old.updated_at
begin
    update tags set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_clients_updated_at
after update on clients
for each row
when new.updated_at = old.updated_at
begin
    update clients set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_emulators_updated_at
after update on emulators
for each row
when new.updated_at = old.updated_at
begin
    update emulators set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_emulator_profiles_updated_at
after update on emulator_profiles
for each row
when new.updated_at = old.updated_at
begin
    update emulator_profiles set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_default_emulator_profiles_updated_at
after update on default_emulator_profiles
for each row
when new.updated_at = old.updated_at
begin
    update default_emulator_profiles set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_local_emulator_configs_updated_at
after update on local_emulator_configs
for each row
when new.updated_at = old.updated_at
begin
    update local_emulator_configs set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_library_root_directories_updated_at
after update on library_root_directories
for each row
when new.updated_at = old.updated_at
begin
    update library_root_directories set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_platform_root_directories_updated_at
after update on platform_root_directories
for each row
when new.updated_at = old.updated_at
begin
    update platform_root_directories set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_game_root_directories_updated_at
after update on game_root_directories
for each row
when new.updated_at = old.updated_at
begin
    update game_root_directories set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_platform_libraries_updated_at
after update on platform_libraries
for each row
when new.updated_at = old.updated_at
begin
    update platform_libraries set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_game_platforms_updated_at
after update on game_platforms
for each row
when new.updated_at = old.updated_at
begin
    update game_platforms set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_platform_tags_updated_at
after update on platform_tags
for each row
when new.updated_at = old.updated_at
begin
    update platform_tags set updated_at = current_timestamp
    where rowid = new.rowid;
end;

create trigger if not exists set_game_tags_updated_at
after update on game_tags
for each row
when new.updated_at = old.updated_at
begin
    update game_tags set updated_at = current_timestamp
    where rowid = new.rowid;
end;
