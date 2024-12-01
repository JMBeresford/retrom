ALTER TABLE "games"
DROP COLUMN "third_party";

ALTER TABLE "platforms"
DROP COLUMN "third_party";

DELETE FROM "platforms"
WHERE
  "path" = '__RETROM_RESERVED__/Steam';

ALTER TABLE "games"
DROP COLUMN "steam_app_id";
