import { queryOptions } from "@tanstack/react-query";
import type { ConnectError } from "@connectrpc/connect";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type {
  GetDefaultEmulatorProfileRequestSchema,
  GetEmulatorProfileRequestSchema,
  GetEmulatorRequestSchema,
  GetLocalEmulatorConfigRequestSchema,
  ListDefaultEmulatorProfilesRequestSchema,
  ListDefaultEmulatorProfilesResponse,
  ListEmulatorProfilesRequestSchema,
  ListEmulatorProfilesResponse,
  ListEmulatorsRequestSchema,
  ListEmulatorsResponse,
  ListLocalEmulatorConfigsRequestSchema,
  ListLocalEmulatorConfigsResponse,
} from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import type { DefaultEmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/default_emulator_profile_pb";
import type { LocalEmulatorConfig } from "@retrom/codegen/retrom/services/emulators/v1/local_emulator_config_pb";

export type EmulatorQueryKey<T extends keyof typeof emulatorQueryKeys> =
  ReturnType<(typeof emulatorQueryKeys)[T]>;

export const emulatorQueryKeys = {
  all: () => ["emulators"] as const,
  getEmulator: (request: MessageInitShape<typeof GetEmulatorRequestSchema>) =>
    [...emulatorQueryKeys.all(), "getEmulator", request] as const,
  listAllEmulators: () =>
    [...emulatorQueryKeys.all(), "listEmulators"] as const,
  listEmulators: (
    request: MessageInitShape<typeof ListEmulatorsRequestSchema>,
  ) => [...emulatorQueryKeys.listAllEmulators(), request] as const,
  getEmulatorProfile: (
    request: MessageInitShape<typeof GetEmulatorProfileRequestSchema>,
  ) => [...emulatorQueryKeys.all(), "getEmulatorProfile", request] as const,
  listAllEmulatorProfiles: () =>
    [...emulatorQueryKeys.all(), "listEmulatorProfiles"] as const,
  listEmulatorProfiles: (
    request: MessageInitShape<typeof ListEmulatorProfilesRequestSchema>,
  ) => [...emulatorQueryKeys.listAllEmulatorProfiles(), request] as const,
  getDefaultEmulatorProfile: (
    request: MessageInitShape<typeof GetDefaultEmulatorProfileRequestSchema>,
  ) =>
    [...emulatorQueryKeys.all(), "getDefaultEmulatorProfile", request] as const,
  listAllDefaultEmulatorProfiles: () =>
    [...emulatorQueryKeys.all(), "listDefaultEmulatorProfiles"] as const,
  listDefaultEmulatorProfiles: (
    request: MessageInitShape<typeof ListDefaultEmulatorProfilesRequestSchema>,
  ) =>
    [...emulatorQueryKeys.listAllDefaultEmulatorProfiles(), request] as const,
  getLocalEmulatorConfig: (
    request: MessageInitShape<typeof GetLocalEmulatorConfigRequestSchema>,
  ) => [...emulatorQueryKeys.all(), "getLocalEmulatorConfig", request] as const,
  listAllLocalEmulatorConfigs: () =>
    [...emulatorQueryKeys.all(), "listLocalEmulatorConfigs"] as const,
  listLocalEmulatorConfigs: (
    request: MessageInitShape<typeof ListLocalEmulatorConfigsRequestSchema>,
  ) => [...emulatorQueryKeys.listAllLocalEmulatorConfigs(), request] as const,
};

export const emulatorQueries = {
  getEmulator: <TData>(
    request: MessageInitShape<typeof GetEmulatorRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      Emulator,
      ConnectError,
      TData,
      EmulatorQueryKey<"getEmulator">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.getEmulator(request),
      queryFn: () => retromClient.emulatorClient.getEmulator(request),
    }),
  listEmulators: <TData>(
    request: MessageInitShape<typeof ListEmulatorsRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListEmulatorsResponse,
      ConnectError,
      TData,
      EmulatorQueryKey<"listEmulators">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.listEmulators(request),
      queryFn: () => retromClient.emulatorClient.listEmulators(request),
    }),
  getEmulatorProfile: <TData>(
    request: MessageInitShape<typeof GetEmulatorProfileRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      EmulatorProfile,
      ConnectError,
      TData,
      EmulatorQueryKey<"getEmulatorProfile">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.getEmulatorProfile(request),
      queryFn: () => retromClient.emulatorClient.getEmulatorProfile(request),
    }),
  listEmulatorProfiles: <TData>(
    request: MessageInitShape<typeof ListEmulatorProfilesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListEmulatorProfilesResponse,
      ConnectError,
      TData,
      EmulatorQueryKey<"listEmulatorProfiles">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.listEmulatorProfiles(request),
      queryFn: () => retromClient.emulatorClient.listEmulatorProfiles(request),
    }),
  getDefaultEmulatorProfile: <TData>(
    request: MessageInitShape<typeof GetDefaultEmulatorProfileRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      DefaultEmulatorProfile,
      ConnectError,
      TData,
      EmulatorQueryKey<"getDefaultEmulatorProfile">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.getDefaultEmulatorProfile(request),
      queryFn: () =>
        retromClient.emulatorClient.getDefaultEmulatorProfile(request),
    }),
  listDefaultEmulatorProfiles: <TData>(
    request: MessageInitShape<typeof ListDefaultEmulatorProfilesRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListDefaultEmulatorProfilesResponse,
      ConnectError,
      TData,
      EmulatorQueryKey<"listDefaultEmulatorProfiles">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.listDefaultEmulatorProfiles(request),
      queryFn: () =>
        retromClient.emulatorClient.listDefaultEmulatorProfiles(request),
    }),
  getLocalEmulatorConfig: <TData>(
    request: MessageInitShape<typeof GetLocalEmulatorConfigRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      LocalEmulatorConfig,
      ConnectError,
      TData,
      EmulatorQueryKey<"getLocalEmulatorConfig">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.getLocalEmulatorConfig(request),
      queryFn: () =>
        retromClient.emulatorClient.getLocalEmulatorConfig(request),
    }),
  listLocalEmulatorConfigs: <TData>(
    request: MessageInitShape<typeof ListLocalEmulatorConfigsRequestSchema>,
    retromClient: RetromClient,
    options: QueryOptionsExt<
      ListLocalEmulatorConfigsResponse,
      ConnectError,
      TData,
      EmulatorQueryKey<"listLocalEmulatorConfigs">
    > = {},
  ) =>
    queryOptions({
      ...options,
      queryKey: emulatorQueryKeys.listLocalEmulatorConfigs(request),
      queryFn: () =>
        retromClient.emulatorClient.listLocalEmulatorConfigs(request),
    }),
};
