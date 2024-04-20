CREATE TABLE "metadata"(
	"game_id" UUID NOT NULL PRIMARY KEY,
  "description" TEXT NOT NULL,
  "cover_url" TEXT NOT NULL,
  "background_url" TEXT NOT NULL,
  CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id")
);

