-- Additive modifications to existing tables.
-- All new columns are nullable so they are safe for existing data.

-- game_metadata: link to a metadata provider, add logo URL
alter table game_metadata
    add column provider_id integer references metadata_providers (id);

alter table game_metadata
    add column logo_url text;

-- platform_metadata: link to a metadata provider, add icon URL
alter table platform_metadata
    add column provider_id integer references metadata_providers (id);

alter table platform_metadata
    add column icon_url text;

-- local_emulator_configs: new fields from the target data model
alter table local_emulator_configs
    add column default_profile_id integer references emulator_profiles (id);

alter table local_emulator_configs
    add column bios_directory text;

alter table local_emulator_configs
    add column extra_files_directory text;
