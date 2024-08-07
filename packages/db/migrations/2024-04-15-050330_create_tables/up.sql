CREATE TABLE "platforms"(
	"id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"path" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("path")
);

CREATE TABLE "games"(
	"id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"path" TEXT NOT NULL,
	"platform_id" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "fk_platform_id" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE,
  UNIQUE("path")
);

CREATE TABLE "game_files"(
	"id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"byte_size" BIGINT NOT NULL,
	"path" TEXT NOT NULL,
	"game_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  UNIQUE("path")
);
