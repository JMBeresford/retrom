import { useQuery } from "@tanstack/react-query";
import { emulatorQueries } from "./queries";
import type { EmulatorQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetEmulatorProfileRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetEmulatorProfile<TData>(
  params: {
    request?: MessageInitShape<typeof GetEmulatorProfileRequestSchema>;
    options?: QueryOptionsExt<
      EmulatorProfile,
      ConnectError,
      TData,
      EmulatorQueryKey<"getEmulatorProfile">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    emulatorQueries.getEmulatorProfile(request, retromClient, options),
  );
}
