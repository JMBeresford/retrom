import { useQuery } from "@tanstack/react-query";
import { emulatorQueries } from "./queries";
import type { EmulatorQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetLocalEmulatorConfigRequestSchema } from "@retrom/codegen/retrom/services/emulators/v1/emulator_service_pb";
import type { LocalEmulatorConfig } from "@retrom/codegen/retrom/services/emulators/v1/local_emulator_config_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetLocalEmulatorConfig<TData>(
  params: {
    request?: MessageInitShape<typeof GetLocalEmulatorConfigRequestSchema>;
    options?: QueryOptionsExt<
      LocalEmulatorConfig,
      ConnectError,
      TData,
      EmulatorQueryKey<"getLocalEmulatorConfig">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(
    emulatorQueries.getLocalEmulatorConfig(request, retromClient, options),
  );
}
