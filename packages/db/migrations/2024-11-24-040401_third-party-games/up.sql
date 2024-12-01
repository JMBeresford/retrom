ALTER TABLE "games"
ADD COLUMN "third_party" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "platforms"
ADD COLUMN "third_party" BOOLEAN NOT NULL DEFAULT FALSE;

INSERT INTO
  "platforms" ("path", "third_party")
VALUES
  ('__RETROM_RESERVED__/Steam', TRUE);

ALTER TABLE "games"
ADD COLUMN "steam_app_id" BIGINT;
