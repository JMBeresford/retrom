import {
  GetEmulatorsRequest,
  GetEmulatorsResponse,
} from "@/generated/retrom/services";
import { useConfig } from "@/providers/config";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";

type SelectFn<S> = (data: GetEmulatorsResponse) => S;

export function useEmulators<T = GetEmulatorsResponse>(
  opts: {
    request?: Partial<GetEmulatorsRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled } = opts;
  const configStore = useConfig();
  const clientId = configStore((store) => store.config.clientInfo.id);
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["emulators", request, retromClient],
    select: selectFn,
    enabled,
    queryFn: async () => {
      const res = await retromClient.emulatorClient.getEmulators(request);
      res.emulators = res.emulators.filter(
        (emulator) => emulator.clientId === clientId,
      );

      return res;
    },
  });
}
