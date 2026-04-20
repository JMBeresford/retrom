create or replace function update_modified_column_timestamp()
returns trigger as
$$
  BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
  END;
$$
language plpgsql;

create or replace trigger update_game_file_timestamp
before update on game_files
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_game_timestamp
before update on games
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_game_metadata_timestamp
before update on game_metadata
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_platform_timestamp
before update on platforms
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_platform_metadata_timestamp
before update on platform_metadata
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_emulator_timestamp
before update on emulators
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_emulator_profile_timestamp
before update on emulator_profiles
for each row execute procedure update_modified_column_timestamp();

create or replace trigger update_default_emulator_profile_timestamp
before update on default_emulator_profiles
for each row execute procedure update_modified_column_timestamp();
