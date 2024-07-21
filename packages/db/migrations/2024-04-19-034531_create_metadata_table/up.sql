CREATE TABLE "platform_metadata"(
  "platform_id" INTEGER PRIMARY KEY,
  "name" TEXT,
  "description" TEXT,
  "background_url" TEXT,
  "logo_url" TEXT,
  "igdb_id" BIGINT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "links" TEXT[] NOT NULL,
  "video_urls" TEXT[] NOT NULL,
  "screenshot_urls" TEXT[] NOT NULL,
  "artwork_urls" TEXT[] NOT NULL,
  CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  UNIQUE("game_id")
);

CREATE TABLE "game_genres" (
  "id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "unique_slug_name" UNIQUE("slug", "name")
);

CREATE TABLE "game_genre_maps" (
  "game_id" INTEGER NOT NULL,
  "genre_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_genre_id" FOREIGN KEY ("genre_id") REFERENCES "game_genres"("id") ON DELETE CASCADE,
  PRIMARY KEY("game_id", "genre_id")
);

CREATE TABLE "similar_game_maps" (
  "game_id" INTEGER NOT NULL,
  "similar_game_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_game_id" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_similar_game_id" FOREIGN KEY ("similar_game_id") REFERENCES "games"("id") ON DELETE CASCADE,
  PRIMARY KEY("game_id", "similar_game_id")
);

