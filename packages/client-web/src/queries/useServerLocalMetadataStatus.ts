import { useRetromClient } from "@/providers/retrom-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";
import {
  GetLocalMetadataStatusRequestSchema,
  GetLocalMetadataStatusResponse,
} from "@retrom/codegen/retrom/services/metadata-service_pb";

type SelectFn<S> = (data: GetLocalMetadataStatusResponse) => S;

export function useServerLocalMetadataStatus<
  T = GetLocalMetadataStatusResponse,
>(
  opts: {
    request?: MessageInitShape<typeof GetLocalMetadataStatusRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled = true } = opts;
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useQuery({
    enabled,
    queryFn: () => retromClient.metadataClient.getLocalMetadataStatus(request),
    queryKey: [
      "server-local-metadata-status",
      queryClient,
      request,
      retromClient,
    ],
    select: selectFn,
  });
}
