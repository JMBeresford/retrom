ALTER TABLE emulator_profiles
DROP CONSTRAINT IF EXISTS emulator_profiles_emulator_id_name_unique;

ALTER TABLE emulators
DROP CONSTRAINT IF EXISTS emulators_name_unique;

-- The duplicate-name cleanup performed in the up migration is intentionally
-- not reversed here because the original names cannot be restored safely.
