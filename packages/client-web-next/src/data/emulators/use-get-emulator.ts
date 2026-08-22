import { useQuery } from "@tanstack/react-query";
import { emulatorQueries } from "./queries";
import type { EmulatorQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetEmulatorRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { Emulator } from "@retrom/codegen/retrom/services/emulators/v1/emulator_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetEmulator<TData = Emulator>(
  params: {
    request?: MessageInitShape<typeof GetEmulatorRequestSchema>;
    options?: QueryOptionsExt<
      Emulator,
      ConnectError,
      TData,
      EmulatorQueryKey<"getEmulator">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(emulatorQueries.getEmulator(request, retromClient, options));
}
