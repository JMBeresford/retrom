CREATE TABLE "platforms"(
	"id" UUID NOT NULL PRIMARY KEY,
	"name" TEXT NOT NULL,
	"path" TEXT NOT NULL,
  UNIQUE("path")
);

CREATE TABLE "games"(
	"id" UUID NOT NULL PRIMARY KEY,
	"name" TEXT NOT NULL,
	"path" TEXT NOT NULL,
	"platform_id" UUID NOT NULL,
	FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE,
  UNIQUE("path")
);

CREATE TABLE "game_files"(
	"id" UUID NOT NULL PRIMARY KEY,
	"name" TEXT NOT NULL,
	"byte_size" INT4 NOT NULL,
	"path" TEXT NOT NULL,
	"hash" TEXT NOT NULL,
	"game_id" UUID NOT NULL,
	FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  UNIQUE("path")
);
