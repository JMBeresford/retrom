ALTER TABLE "platforms" DROP COLUMN "deleted_at";
ALTER TABLE "platforms" DROP COLUMN "is_deleted";

ALTER TABLE "games" DROP COLUMN "deleted_at";
ALTER TABLE "games" DROP COLUMN "is_deleted";
ALTER TABLE "games" DROP COLUMN "default_file_id";

ALTER TABLE "game_files" DROP COLUMN "deleted_at";
ALTER TABLE "game_files" DROP COLUMN "is_deleted";
ALTER TABLE "games" DROP COLUMN "default_file_id";

