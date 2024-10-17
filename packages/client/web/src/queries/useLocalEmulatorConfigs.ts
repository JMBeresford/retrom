import {
  GetLocalEmulatorConfigsRequest,
  GetLocalEmulatorConfigsResponse,
} from "@/generated/retrom/services";
import { useConfig } from "@/providers/config";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type SelectFn<S> = (data: GetLocalEmulatorConfigsResponse) => S;

export function useLocalEmulatorConfigs<T = GetLocalEmulatorConfigsResponse>(
  opts: {
    request?: Partial<GetLocalEmulatorConfigsRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled } = opts;
  const configStore = useConfig();
  const clientId = configStore((store) => store.config.clientInfo.id);
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
    queryFn: () => retromClient.emulatorClient.getLocalEmulatorConfigs(req),
  });
}
