CREATE TABLE "emulators"(
  "id" INTEGER PRIMARY KEY,
  "supported_platforms" INTEGER[] NOT NULL,
  "name" TEXT NOT NULL,
  "rom_type" INTEGER NOT NULL,
  "executable_path" TEXT NOT NULL
);

CREATE TABLE "emulator_profiles" (
  "id" INTEGER PRIMARY KEY,
  "emulator_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "supported_extensions" TEXT[] NOT NULL,
  "extra_args" TEXT,
  CONSTRAINT "fk_emulator_id" FOREIGN KEY ("emulator_id") REFERENCES "emulators"("id") ON DELETE CASCADE
);
