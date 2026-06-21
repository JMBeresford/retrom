-- Auto-update updated_at timestamps on row modification (PostgreSQL).
-- A single shared trigger function is reused by a per-table trigger.

create or replace function set_updated_at_timestamp()
returns trigger as
$$
begin
    new.updated_at := current_timestamp::text;
    return new;
end;
$$
language plpgsql;

create or replace trigger set_metadata_providers_updated_at
before update on metadata_providers
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_libraries_updated_at
before update on libraries
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_root_directories_updated_at
before update on root_directories
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_platforms_updated_at
before update on platforms
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_games_updated_at
before update on games
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_game_files_updated_at
before update on game_files
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_default_game_files_updated_at
before update on default_game_files
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_platform_metadata_updated_at
before update on platform_metadata
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_game_metadata_updated_at
before update on game_metadata
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_similar_games_updated_at
before update on similar_games
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_tag_domains_updated_at
before update on tag_domains
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_tags_updated_at
before update on tags
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_clients_updated_at
before update on clients
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_emulators_updated_at
before update on emulators
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_emulator_profiles_updated_at
before update on emulator_profiles
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_default_emulator_profiles_updated_at
before update on default_emulator_profiles
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_local_emulator_configs_updated_at
before update on local_emulator_configs
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_library_root_directories_updated_at
before update on library_root_directories
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_platform_root_directories_updated_at
before update on platform_root_directories
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_game_root_directories_updated_at
before update on game_root_directories
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_platform_libraries_updated_at
before update on platform_libraries
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_game_platforms_updated_at
before update on game_platforms
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_platform_tags_updated_at
before update on platform_tags
for each row execute procedure set_updated_at_timestamp();

create or replace trigger set_game_tags_updated_at
before update on game_tags
for each row execute procedure set_updated_at_timestamp();
