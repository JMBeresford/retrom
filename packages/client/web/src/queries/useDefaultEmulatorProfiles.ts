import {
  GetDefaultEmulatorProfilesRequest,
  GetDefaultEmulatorProfilesResponse,
} from "@/generated/retrom/services";
import { useConfig } from "@/providers/config";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Metadata } from "nice-grpc-common";
import { useMemo } from "react";

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

  const clientInfo = useConfig((s) => s.config?.clientInfo);
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  const metadata = useMemo(() => {
    const clientId = clientInfo?.id.toString();
    const meta = new Metadata({ "x-client-id": clientId ?? [] });

    return meta;
  }, [clientInfo]);

  return useQuery({
    enabled,
    queryFn: () =>
      retromClient.emulatorClient.getDefaultEmulatorProfiles(request, {
        metadata,
      }),
    queryKey: [
      "default-emulator-profiles",
      "emulator-profiles",
      queryClient,
      request,
      metadata,
    ],
    select: selectFn,
  });
}
