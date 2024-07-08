import {
  GetPlatformsRequest,
  GetPlatformsResponse,
} from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";

export function usePlatforms<S = GetPlatformsResponse>(
  opts: {
    request?: Partial<GetPlatformsRequest>;
    selectFn?: (data: GetPlatformsResponse) => S;
  } = {},
) {
  const { request = {}, selectFn } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["platforms", "platform-metadata", request],
    queryFn: async () =>
      await retromClient.platformClient.getPlatforms(request),
    select: selectFn,
  });
}
