CREATE OR REPLACE FUNCTION update_modified_column_timestamp()
RETURNS TRIGGER AS
$$
  BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
  END;
$$
language 'plpgsql';

CREATE OR REPLACE TRIGGER update_game_file_timestamp
BEFORE UPDATE ON game_files
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_game_timestamp
BEFORE UPDATE ON games
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_game_metadata_timestamp
BEFORE UPDATE ON game_metadata
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_platform_timestamp
BEFORE UPDATE ON platforms 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_platform_metadata_timestamp
BEFORE UPDATE ON platform_metadata
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_emulator_timestamp
BEFORE UPDATE ON emulators
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_emulator_profile_timestamp
BEFORE UPDATE ON emulator_profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();

CREATE OR REPLACE TRIGGER update_default_emulator_profile_timestamp
BEFORE UPDATE ON default_emulator_profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column_timestamp();
