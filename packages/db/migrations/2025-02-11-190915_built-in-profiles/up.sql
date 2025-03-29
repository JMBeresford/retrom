alter table emulator_profiles add column built_in boolean not null default false;

insert into emulator_profiles (emulator_id, name, built_in, supported_extensions, custom_args)
select
    emulators.id,
    'Default'        as profile_name,
    true             as built_in,
    array[]::text [] as supported_extensions,
    array['{file}']  as custom_args
from emulators
where emulators.id not in (select emulator_profiles.emulator_id from emulator_profiles);

create or replace function create_default_emulator_profile()
returns trigger as
$$
BEGIN
insert into emulator_profiles (emulator_id, name, built_in, supported_extensions, custom_args)
select
    NEW.id,
    'Default' as profile_name,
    true as built_in,
    array[]::text [] as supported_extensions,
    array['{file}'] as custom_args
on conflict do nothing;

return NEW;
END;
$$
language plpgsql;

create or replace trigger create_default_profile_for_new_emulator
after insert on emulators
for each row execute procedure create_default_emulator_profile();
