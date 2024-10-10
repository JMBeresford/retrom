ALTER TABLE "default_emulator_profiles" DROP CONSTRAINT "default_emulator_profiles_pkey";
ALTER TABLE "default_emulator_profiles" DROP CONSTRAINT "fk_client_id";
ALTER TABLE "default_emulator_profiles" DROP COLUMN "client_id";
ALTER TABLE "default_emulator_profiles" ADD CONSTRAINT "default_emulator_profiles_pkey" PRIMARY KEY ("platform_id");
