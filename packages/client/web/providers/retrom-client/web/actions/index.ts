import { RetromClient } from "@/providers/retrom-client";
import { getGames } from "./games";
import { deleteLibrary, updateLibrary, updateLibraryMetadata } from "./library";
import {
  getIgdbSearch,
  getIgdbPlatformSearchResults,
  getIgdbGameSearchResults,
  updatePlatformMetadata,
  getPlatformMetadata,
  updateGameMetadata,
  getGameMetadata,
} from "./metadata";
import { getPlatforms } from "./platforms";

export const RetromWebClient: RetromClient = {
  gameClient: { getGames },
  libraryClient: {
    deleteLibrary,
    updateLibrary,
    updateLibraryMetadata,
  },
  metadataClient: {
    getIgdbSearch,
    getGameMetadata,
    updateGameMetadata,
    getPlatformMetadata,
    updatePlatformMetadata,
    getIgdbGameSearchResults,
    getIgdbPlatformSearchResults,
  },
  platformClient: {
    getPlatforms,
  },
};
