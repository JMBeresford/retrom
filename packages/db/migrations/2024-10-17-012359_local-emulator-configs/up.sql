CREATE TABLE "local_emulator_configs" (
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "emulator_id" INTEGER NOT NULL,
  "client_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP
  WITH
    TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP
  WITH
    TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "executable_path" TEXT NOT NULL,
    "nickname" TEXT DEFAULT NULL,
    CONSTRAINT "uq_local_emulator_configs_emulator_id_client_id" UNIQUE ("emulator_id", "client_id"),
    CONSTRAINT "fk_local_emulator_configs_emulators" FOREIGN KEY ("emulator_id") REFERENCES "emulators" ("id") ON DELETE CASCADE,
    CONSTRAINT "fk_local_emulator_configs_clients" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE
);

-- move the executable_path column from emulators table to local_emulator_configs table
INSERT INTO
  "local_emulator_configs" (emulator_id, client_id, executable_path)
SELECT
  id,
  client_id,
  executable_path
FROM
  emulators ON CONFLICT DO NOTHING;

-- drop the columns from emulators table
ALTER TABLE emulators
DROP COLUMN executable_path;

ALTER TABLE emulators
DROP COLUMN client_id CASCADE;
