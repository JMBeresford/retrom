import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  StatSaveFilesRequestSchema,
  StatSaveFilesResponse,
  StatSaveStatesRequestSchema,
  StatSaveStatesResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator_saves_service_pb";

export type SavesQueryKey<T extends keyof typeof savesQueryKeys> = ReturnType<
  (typeof savesQueryKeys)[T]
>;

export const savesQueryKeys = {
  all: () => ["saves"] as const,
  allStatSaveFiles: () => [...savesQueryKeys.all(), "statSaveFiles"] as const,
  statSaveFiles: (
    request: MessageInitShape<typeof StatSaveFilesRequestSchema>,
  ) => [...savesQueryKeys.allStatSaveFiles(), request] as const,
  allStatSaveState: () => [...savesQueryKeys.all(), "statSaveState"] as const,
  statSaveStates: (
    request: MessageInitShape<typeof StatSaveStatesRequestSchema>,
  ) => [...savesQueryKeys.allStatSaveState(), request] as const,
};

export const savesQueries = {
  statSaveFiles: <TData>(
    request: MessageInitShape<typeof StatSaveFilesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      StatSaveFilesResponse,
      ConnectError,
      TData,
      SavesQueryKey<"statSaveFiles">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: savesQueryKeys.statSaveFiles(request),
      queryFn: async () =>
        retromClient.emulatorSavesClient.statSaveFiles(request),
    }),
  statSaveStates: <TData>(
    request: MessageInitShape<typeof StatSaveStatesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      StatSaveStatesResponse,
      ConnectError,
      TData,
      SavesQueryKey<"statSaveStates">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: savesQueryKeys.statSaveStates(request),
      queryFn: async () =>
        retromClient.emulatorSavesClient.statSaveStates(request),
    }),
};
