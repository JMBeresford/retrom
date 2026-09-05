import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type {
  GetGameRequestSchema,
  GetLibraryRequestSchema,
  GetPlatformRequestSchema,
  ListGameFilesRequestSchema,
  ListGameFilesResponse,
  ListGamesRequestSchema,
  ListGamesResponse,
  ListLibrariesRequestSchema,
  ListLibrariesResponse,
  ListPlatformsRequestSchema,
  ListPlatformsResponse,
} from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type {
  Game,
  Library,
  Platform,
} from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import type { QueryOptionsExt } from "../common";

export type LibraryQueryKey<T extends keyof typeof libraryQueryKeys> =
  ReturnType<(typeof libraryQueryKeys)[T]>;

export const libraryQueryKeys = {
  all: () => ["libraries"] as const,
  getLibrary: (request: MessageInitShape<typeof GetLibraryRequestSchema>) =>
    [...libraryQueryKeys.all(), "getLibrary", request] as const,
  listAllLibraries: () =>
    [...libraryQueryKeys.all(), "listAllLibraries"] as const,
  listLibraries: (
    request: MessageInitShape<typeof ListLibrariesRequestSchema>,
  ) => [...libraryQueryKeys.listAllLibraries(), request] as const,
  getGame: (request: MessageInitShape<typeof GetGameRequestSchema>) =>
    [...libraryQueryKeys.all(), "getGame", request] as const,
  listAllGames: () => [...libraryQueryKeys.all(), "listAllGames"] as const,
  listGames: (request: MessageInitShape<typeof ListGamesRequestSchema>) =>
    [...libraryQueryKeys.listAllGames(), request] as const,
  getPlatform: (request: MessageInitShape<typeof GetPlatformRequestSchema>) =>
    [...libraryQueryKeys.all(), "getPlatform", request] as const,
  listAllPlatforms: () =>
    [...libraryQueryKeys.all(), "listAllPlatforms"] as const,
  listPlatforms: (
    request: MessageInitShape<typeof ListPlatformsRequestSchema>,
  ) => [...libraryQueryKeys.listAllPlatforms(), request] as const,
  listAllGameFiles: () =>
    [...libraryQueryKeys.all(), "listAllGameFiles"] as const,
  listGameFiles: (
    request: MessageInitShape<typeof ListGameFilesRequestSchema>,
  ) => [...libraryQueryKeys.listAllGameFiles(), request] as const,
};

export const libraryQueries = {
  getLibrary: <TData>(
    request: MessageInitShape<typeof GetLibraryRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      Library,
      ConnectError,
      TData,
      LibraryQueryKey<"getLibrary">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.getLibrary(request),
      queryFn: () => retromClient.libraryClient.getLibrary(request),
    }),
  listLibraries: <TData>(
    request: MessageInitShape<typeof ListLibrariesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListLibrariesResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listLibraries">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.listLibraries(request),
      queryFn: () => retromClient.libraryClient.listLibraries(request),
    }),
  getGame: <TData>(
    request: MessageInitShape<typeof GetGameRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      Game,
      ConnectError,
      TData,
      LibraryQueryKey<"getGame">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.getGame(request),
      queryFn: () => retromClient.libraryClient.getGame(request),
    }),
  listGames: <TData>(
    request: MessageInitShape<typeof ListGamesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListGamesResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listGames">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.listGames(request),
      queryFn: () => retromClient.libraryClient.listGames(request),
    }),
  getPlatform: <TData>(
    request: MessageInitShape<typeof GetPlatformRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      Platform,
      ConnectError,
      TData,
      LibraryQueryKey<"getPlatform">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.getPlatform(request),
      queryFn: () => retromClient.libraryClient.getPlatform(request),
    }),
  listPlatforms: <TData>(
    request: MessageInitShape<typeof ListPlatformsRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListPlatformsResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listPlatforms">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.listPlatforms(request),
      queryFn: () => retromClient.libraryClient.listPlatforms(request),
    }),
  listGameFiles: <TData>(
    request: MessageInitShape<typeof ListGameFilesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListGameFilesResponse,
      ConnectError,
      TData,
      LibraryQueryKey<"listGameFiles">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: libraryQueryKeys.listGameFiles(request),
      queryFn: () => retromClient.libraryClient.listGameFiles(request),
    }),
};
