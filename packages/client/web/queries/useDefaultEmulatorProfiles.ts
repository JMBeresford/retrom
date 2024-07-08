import {
  GetDefaultEmulatorProfilesRequest,
  GetDefaultEmulatorProfilesResponse,
} from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type SelectFn<S> = (data: GetDefaultEmulatorProfilesResponse) => S;

export function useDefaultEmulatorProfiles<
  T = GetDefaultEmulatorProfilesResponse,
>(
  opts: {
    request?: Partial<GetDefaultEmulatorProfilesRequest>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () =>
      retromClient.emulatorClient.getDefaultEmulatorProfiles(request),
    queryKey: ["default-emulator-profiles", queryClient, request],
    select: selectFn,
  });
}
