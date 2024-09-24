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
  const dir = direction === "asc" ? 1 : -1;

  switch (platformSortKey) {
    case "name": {
      const aName = a.metadata?.name || getFileStub(a.path) || "";
      const bName = b.metadata?.name || getFileStub(b.path) || "";

      return aName.localeCompare(bName) * dir;
    }
    case "updatedAt":
    case "createdAt": {
      const aDate = timestampToDate(a[platformSortKey]).getMilliseconds();
      const bDate = timestampToDate(b[platformSortKey]).getMilliseconds();

      return (aDate - bDate) * dir;
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
  const dir = direction === "asc" ? 1 : -1;

  switch (gameSortKey) {
    case "name": {
      const aName = a.metadata?.name || getFileStub(a.path) || "";
      const bName = b.metadata?.name || getFileStub(b.path) || "";

      return aName.localeCompare(bName) * dir;
    }
    case "createdAt":
    case "updatedAt": {
      const aDate = timestampToDate(a[gameSortKey]).getMilliseconds();
      const bDate = timestampToDate(b[gameSortKey]).getMilliseconds();

      return (aDate - bDate) * dir;
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
