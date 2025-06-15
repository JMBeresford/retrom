import {
  GetDefaultEmulatorProfilesRequestSchema,
  GetDefaultEmulatorProfilesResponse,
} from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useConfig } from "@/providers/config";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetDefaultEmulatorProfilesResponse) => S;

export function useDefaultEmulatorProfiles<
  T = GetDefaultEmulatorProfilesResponse,
>(
  opts: {
    request?: MessageInitShape<typeof GetDefaultEmulatorProfilesRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;

  const clientInfo = useConfig((s) => s.config?.clientInfo);
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  const headers = useMemo(() => {
    const clientId = clientInfo?.id?.toString() ?? "-1";
    const meta = new Headers({ "x-client-id": clientId });

    return meta;
  }, [clientInfo]);

  return useQuery({
    enabled,
    queryFn: () =>
      retromClient.emulatorClient.getDefaultEmulatorProfiles(request, {
        headers,
      }),
    queryKey: [
      "default-emulator-profiles",
      "emulator-profiles",
      queryClient,
      request,
      headers,
    ],
    select: selectFn,
  });
}
