CREATE TABLE "emulators"(
	"id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "supported_platforms" INTEGER[] NOT NULL,
  "name" TEXT NOT NULL,
  "rom_type" INTEGER NOT NULL
);

CREATE TABLE "emulator_profiles" (
	"id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "emulator_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "executable_path" TEXT NOT NULL,
  "supported_extensions" TEXT[] NOT NULL,
  "custom_args" TEXT[] NOT NULL,
  CONSTRAINT "fk_emulator_id" FOREIGN KEY ("emulator_id") REFERENCES "emulators"("id") ON DELETE CASCADE
);

CREATE TABLE "default_emulator_profiles" (
  "platform_id" INTEGER PRIMARY KEY,
  "emulator_profile_id" INTEGER NOT NULL,
  CONSTRAINT "fk_platform_id" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_profile_id" FOREIGN KEY ("emulator_profile_id") REFERENCES "emulator_profiles"("id") ON DELETE CASCADE
)
