DROP TRIGGER update_game_file_timestamp ON game_files;

DROP TRIGGER update_game_timestamp ON games;
DROP TRIGGER update_game_metadata_timestamp ON game_metadata;

DROP TRIGGER update_platform_timestamp ON platforms;
DROP TRIGGER update_platform_metadata_timestamp ON platform_metadata;

DROP TRIGGER update_emulator_timestamp ON emulators;
DROP TRIGGER update_emulator_profile_timestamp ON emulator_profiles;
DROP TRIGGER update_default_emulator_profile_timestamp ON default_emulator_profiles;

DROP FUNCTION update_modified_column_timestamp();

