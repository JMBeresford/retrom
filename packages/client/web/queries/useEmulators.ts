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
  } = {},
) {
  const { request = {}, selectFn } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["emulators", request, retromClient],
    select: selectFn,
    queryFn: async () => {
      return await retromClient.emulatorClient.getEmulators(request);
    },
  });
}
