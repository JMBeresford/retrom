import { Platform } from "@/generated/retrom/models/platforms";
import { GameSortKey, PlatformSortKey } from "./filter-sort-context";
import { getFileStub, timestampToDate } from "@/lib/utils";
import { Game } from "@/generated/retrom/models/games";
import {
  GameMetadata,
  PlatformMetadata,
} from "@/generated/retrom/models/metadata";

export function sortPlatforms<
  P extends Platform & { metadata?: PlatformMetadata },
>(a: P, b: P, platformSortKey: PlatformSortKey) {
  switch (platformSortKey) {
    case "name": {
      const aName = a.metadata?.name || getFileStub(a.path) || "";
      const bName = b.metadata?.name || getFileStub(b.path) || "";

      return aName.localeCompare(bName);
    }
    case "updatedAt":
    case "createdAt": {
      const aDate = timestampToDate(a[platformSortKey]).getMilliseconds();
      const bDate = timestampToDate(b[platformSortKey]).getMilliseconds();

      return aDate - bDate;
    }
    default:
      return 0;
  }
}

export function sortGames<G extends Game & { metadata?: GameMetadata }>(
  a: G,
  b: G,
  gameSortKey: GameSortKey,
) {
  switch (gameSortKey) {
    case "name": {
      const aName = a.metadata?.name || getFileStub(a.path) || "";
      const bName = b.metadata?.name || getFileStub(b.path) || "";

      return aName.localeCompare(bName);
    }
    case "createdAt":
    case "updatedAt": {
      const aDate = timestampToDate(a[gameSortKey]).getMilliseconds();
      const bDate = timestampToDate(b[gameSortKey]).getMilliseconds();

      return aDate - bDate;
    }
    case "lastPlayed": {
      const aDate = timestampToDate(a.metadata?.lastPlayed).getMilliseconds();
      const bDate = timestampToDate(b.metadata?.lastPlayed).getMilliseconds();

      return aDate - bDate;
    }
  }
}

export function filterName<
  M extends { name?: string },
  T extends { path: string; metadata?: M },
>(entity: T, filter?: string) {
  if (!filter) return true;

  const name = entity.metadata?.name || getFileStub(entity.path) || "";

  const normalizedName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const normalizedFilter = filter
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalizedName.includes(normalizedFilter);
}
