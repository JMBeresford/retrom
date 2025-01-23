alter table default_emulator_profiles drop constraint "default_emulator_profiles_pkey";

alter table default_emulator_profiles add column client_id integer default 1;
alter table default_emulator_profiles add constraint fk_client_id foreign key (
    client_id
) references clients (id) on delete cascade;

alter table default_emulator_profiles add constraint default_emulator_profiles_pkey primary key (
    platform_id, client_id
);
