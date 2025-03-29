import {
  GetEmulatorProfilesRequestSchema,
  GetEmulatorProfilesResponse,
} from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetEmulatorProfilesResponse) => S;

export function useEmulatorProfiles<T = GetEmulatorProfilesResponse>(
  opts: {
    request?: MessageInitShape<typeof GetEmulatorProfilesRequestSchema>;
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
