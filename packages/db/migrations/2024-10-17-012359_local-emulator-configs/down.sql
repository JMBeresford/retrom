-- put the removed columns back on emulators table
ALTER TABLE emulators
ADD COLUMN executable_path TEXT NOT NULL;

ALTER TABLE emulators
ADD COLUMN client_id INTEGER NOT NULL;

ALTER TABLE emulators ADD CONSTRAINT fk_client_id FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE;

-- Migrate data back to the emulator table
UPDATE emulators
SET
  executable_path = lec.executable_path,
  client_id = lec.client_id
FROM
  local_emulator_configs lec
WHERE
  emulators.id = lec.emulator_id
  AND lec.executable_path IS NOT NULL;

-- DROP TABLE "local_emulator_configs";
DROP TABLE "local_emulator_configs";
