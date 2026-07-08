import { queryOptions } from "@tanstack/react-query";
import type { GetLibrariesRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library-service_pb";
import type { RetromClient } from "@/api-client/client";
import type { MessageInitShape } from "@bufbuild/protobuf";

export const libraryKeys = {
  all: ["libraries"] as const,
  get: (
    request: MessageInitShape<typeof GetLibrariesRequestSchema>,
    client: RetromClient,
  ) => [...libraryKeys.all, "get", request, client] as const,
};

export const libraryQueries = {
  get: (
    request: MessageInitShape<typeof GetLibrariesRequestSchema>,
    retromClient: RetromClient,
  ) =>
    queryOptions({
      queryKey: libraryKeys.get(request, retromClient),
      queryFn: () => retromClient.libraryClient.getLibraries(request),
      select: (res) => res.libraries,
    }),
};
