import {
  GetEmulatorProfilesRequest,
  GetEmulatorProfilesResponse,
} from "@retrom/codegen/retrom/services/emulator-service";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type SelectFn<S> = (data: GetEmulatorProfilesResponse) => S;

export function useEmulatorProfiles<T = GetEmulatorProfilesResponse>(
  opts: {
    request?: Partial<GetEmulatorProfilesRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.emulatorClient.getEmulatorProfiles(request),
    queryKey: ["emulator-profiles", queryClient, request],
    select: selectFn,
  });
}
