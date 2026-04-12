drop trigger update_game_file_timestamp on game_files;

drop trigger update_game_timestamp on games;
drop trigger update_game_metadata_timestamp on game_metadata;

drop trigger update_platform_timestamp on platforms;
drop trigger update_platform_metadata_timestamp on platform_metadata;

drop trigger update_emulator_timestamp on emulators;
drop trigger update_emulator_profile_timestamp on emulator_profiles;
drop trigger update_default_emulator_profile_timestamp on default_emulator_profiles;

drop function update_modified_column_timestamp();
