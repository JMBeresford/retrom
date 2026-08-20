import { useQuery } from "@tanstack/react-query";
import { emulatorQueries } from "./queries";
import type { EmulatorQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  ListEmulatorProfilesRequestSchema,
  ListEmulatorProfilesResponse,
} from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useListEmulatorProfiles<TData>(
  params: {
    request?: MessageInitShape<typeof ListEmulatorProfilesRequestSchema>;
    options?: QueryOptionsExt<
      ListEmulatorProfilesResponse,
      ConnectError,
      TData,
      EmulatorQueryKey<"listEmulatorProfiles">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    emulatorQueries.listEmulatorProfiles(request, retromClient, options),
  );
}
