import { Platform } from "@/generated/retrom/models/platforms";
import {
  GameSortKey,
  PlatformSortKey,
  SortDirection,
} from "./filter-sort-context";
import { getFileStub, timestampToDate } from "@/lib/utils";
import { Game } from "@/generated/retrom/models/games";
import {
  GameMetadata,
  PlatformMetadata,
} from "@/generated/retrom/models/metadata";

export function sortPlatforms<
  P extends Platform & { metadata?: PlatformMetadata },
>(a: P, b: P, platformSortKey: PlatformSortKey, direction: SortDirection) {
  switch (platformSortKey) {
    case "name": {
      const aName = a.metadata?.name || getFileStub(a.path) || "";
      const bName = b.metadata?.name || getFileStub(b.path) || "";

      if (direction === "asc") {
        return aName.localeCompare(bName);
      }

      return bName.localeCompare(aName);
    }
    case "updatedAt":
    case "createdAt": {
      const aDate = timestampToDate(a[platformSortKey]).getMilliseconds();
      const bDate = timestampToDate(b[platformSortKey]).getMilliseconds();

      if (direction === "asc") {
        return aDate - bDate;
      }

      return bDate - aDate;
    }
    default:
      return 0;
  }
}

export function sortGames<G extends Game & { metadata?: GameMetadata }>(
  a: G,
  b: G,
  gameSortKey: GameSortKey,
  direction: SortDirection,
) {
  switch (gameSortKey) {
    case "name": {
      const aName = a.metadata?.name || getFileStub(a.path) || "";
      const bName = b.metadata?.name || getFileStub(b.path) || "";

      if (direction === "asc") {
        return aName.localeCompare(bName);
      }

      return bName.localeCompare(aName);
    }
    case "createdAt":
    case "updatedAt": {
      const aDate = timestampToDate(a[gameSortKey]).getMilliseconds();
      const bDate = timestampToDate(b[gameSortKey]).getMilliseconds();

      if (direction === "asc") {
        return aDate - bDate;
      }

      return bDate - aDate;
    }
    case "minutesPlayed": {
      const aTime = a.metadata?.minutesPlayed;
      const bTime = b.metadata?.minutesPlayed;

      // undefined values should be at the end
      if (aTime === undefined) return 1;
      if (bTime === undefined) return -1;

      if (direction === "asc") {
        return aTime - bTime;
      }

      return bTime - aTime;
    }
    case "lastPlayed": {
      const aTime = a.metadata?.lastPlayed;
      const bTime = b.metadata?.lastPlayed;

      // undefined values should be at the end
      if (!aTime) return 1;
      if (!bTime) return -1;

      const aDate = timestampToDate(a.metadata?.lastPlayed).getMilliseconds();
      const bDate = timestampToDate(b.metadata?.lastPlayed).getMilliseconds();

      if (direction === "asc") {
        return aDate - bDate;
      }

      return bDate - aDate;
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
