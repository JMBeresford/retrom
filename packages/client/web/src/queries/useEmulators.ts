import {
  GetEmulatorsRequest,
  GetEmulatorsResponse,
} from "@/generated/retrom/services";
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
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["emulators", request, retromClient],
    select: selectFn,
    enabled,
    queryFn: () => retromClient.emulatorClient.getEmulators(request),
  });
}
