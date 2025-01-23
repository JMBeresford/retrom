alter table default_emulator_profiles drop constraint "default_emulator_profiles_pkey";
alter table default_emulator_profiles drop constraint "fk_client_id";
alter table default_emulator_profiles drop column client_id;
alter table default_emulator_profiles add constraint default_emulator_profiles_pkey primary key (
    platform_id
);
