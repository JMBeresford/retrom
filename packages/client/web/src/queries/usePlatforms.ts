import type {
  GetPlatformsRequest,
  GetPlatformsResponse,
} from "@retrom/codegen/retrom/services_pb";
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
    queryKey: ["platforms", "platform-metadata", request, retromClient],
    queryFn: async () => {
      const response = await retromClient.platformClient.getPlatforms(request);
      return response as GetPlatformsResponse;
    },
    select: selectFn,
  });
}
