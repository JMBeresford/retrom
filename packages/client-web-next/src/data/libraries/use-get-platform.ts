import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { LibraryQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type { GetPlatformRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library_service_pb";
import type { Platform } from "@retrom/codegen/retrom/services/library/v1/resources_pb";
import { useRetromClient } from "@/api-client/context";

export function useGetPlatform<TData = Platform>(
  params: {
    request?: MessageInitShape<typeof GetPlatformRequestSchema>;
    options?: QueryOptionsExt<
      Platform,
      ConnectError,
      TData,
      LibraryQueryKey<"getPlatform">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.getPlatform(request, retromClient, options));
}
