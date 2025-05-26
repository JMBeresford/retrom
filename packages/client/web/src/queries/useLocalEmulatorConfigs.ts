import {
  GetLocalEmulatorConfigsRequestSchema,
  type GetLocalEmulatorConfigsResponse,
} from "@retrom/codegen/retrom/services_pb";
import { useConfig } from "@/providers/config";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetLocalEmulatorConfigsResponse) => S;

export function useLocalEmulatorConfigs<T = GetLocalEmulatorConfigsResponse>(
  opts: {
    request?: MessageInitShape<typeof GetLocalEmulatorConfigsRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled } = opts;
  const clientId = useConfig((store) => store.config?.clientInfo?.id);
  const retromClient = useRetromClient();

  const req = useMemo(
    () => ({
      emulatorIds: request.emulatorIds ?? [],
      clientId,
    }),
    [request.emulatorIds, clientId],
  );

  return useQuery({
    queryKey: ["local-emulator-configs", req, retromClient, clientId],
    select: selectFn,
    enabled,
    queryFn: async () => {
      const response =
        await retromClient.emulatorClient.getLocalEmulatorConfigs(req);
      return response;
    },
  });
}
