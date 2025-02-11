drop trigger create_default_profile_for_new_emulator on emulators;
drop function create_default_emulator_profile();

delete from emulator_profiles
where built_in = true and name = 'Default';

alter table emulator_profiles drop column built_in;
