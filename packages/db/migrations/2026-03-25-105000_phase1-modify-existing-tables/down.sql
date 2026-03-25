alter table local_emulator_configs drop column extra_files_directory;
alter table local_emulator_configs drop column bios_directory;
alter table local_emulator_configs drop column default_profile_id;

alter table platform_metadata drop column icon_url;
alter table platform_metadata drop column provider_id;

alter table game_metadata drop column logo_url;
alter table game_metadata drop column provider_id;
