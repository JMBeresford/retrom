CREATE TABLE "metadata"(
	"game_id" UUID NOT NULL PRIMARY KEY,
  "description" TEXT ,
  "cover_url" TEXT,
  "background_url" TEXT,
  "icon_url" TEXT,
  "igdb_id" NUMERIC(20,0),
  CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE
);

