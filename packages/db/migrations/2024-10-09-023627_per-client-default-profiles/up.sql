ALTER TABLE "default_emulator_profiles" DROP CONSTRAINT "default_emulator_profiles_pkey";

ALTER TABLE "default_emulator_profiles" ADD COLUMN "client_id" INTEGER DEFAULT 1;
ALTER TABLE "default_emulator_profiles" ADD CONSTRAINT "fk_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE;

ALTER TABLE "default_emulator_profiles" ADD CONSTRAINT "default_emulator_profiles_pkey" PRIMARY KEY ("platform_id", "client_id");
