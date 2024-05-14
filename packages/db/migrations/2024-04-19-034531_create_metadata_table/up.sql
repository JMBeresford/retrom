CREATE TABLE "platform_metadata"(
  "platform_id" INTEGER PRIMARY KEY,
  "name" TEXT,
  "description" TEXT,
  "background_url" TEXT,
  "icon_url" TEXT,
  "igdb_id" BIGINT,
  CONSTRAINT "fk_platform_id" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE,
  UNIQUE("platform_id")
);

CREATE TABLE "game_metadata"(
  "game_id" INTEGER PRIMARY KEY,
  "name" TEXT,
  "description" TEXT,
  "cover_url" TEXT,
  "background_url" TEXT,
  "icon_url" TEXT,
  "igdb_id" BIGINT,
  CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  UNIQUE("game_id")
);
