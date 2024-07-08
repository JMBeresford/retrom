import { RetromClient } from "@/providers/retrom-client";
import { getGames, deleteGames } from "./games";
import { deleteLibrary, updateLibrary, updateLibraryMetadata } from "./library";
import {
  getEmulators,
  deleteEmulators,
  updateEmulators,
  createEmulators,
} from "./emulators";
import {
  getIgdbSearch,
  getIgdbPlatformSearchResults,
  getIgdbGameSearchResults,
  updatePlatformMetadata,
  getPlatformMetadata,
  updateGameMetadata,
  getGameMetadata,
} from "./metadata";
import { getPlatforms, deletePlatforms } from "./platforms";

export const RetromWebClient: RetromClient = {
  gameClient: { getGames, deleteGames },
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
    deletePlatforms,
  },
  emulatorClient: {
    getEmulators,
    createEmulators,
    deleteEmulators,
    updateEmulators,
  },
};
