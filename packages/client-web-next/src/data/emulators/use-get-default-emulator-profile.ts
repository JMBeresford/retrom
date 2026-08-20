import { useQuery } from "@tanstack/react-query";
import { emulatorQueries } from "./queries";
import type { EmulatorQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetDefaultEmulatorProfileRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { DefaultEmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/default_emulator_profile_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetDefaultEmulatorProfile<TData>(
  params: {
    request?: MessageInitShape<typeof GetDefaultEmulatorProfileRequestSchema>;
    options?: QueryOptionsExt<
      DefaultEmulatorProfile,
      ConnectError,
      TData,
      EmulatorQueryKey<"getDefaultEmulatorProfile">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    emulatorQueries.getDefaultEmulatorProfile(request, retromClient, options),
  );
}
