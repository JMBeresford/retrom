import { queryOptions } from "@tanstack/react-query";
import type { GetLibrariesRequest } from "@retrom/codegen/retrom/services/library/v1/library-service_pb";

export const libraryKeys = {
  all: ["libraries"] as const,
  get: (request: GetLibrariesRequest) =>
    [...libraryKeys.all, "get", request] as const,
};

export const libraryQueries = {
  get: (request: GetLibrariesRequest) =>
    queryOptions({
      queryKey: libraryKeys.get(request),
      queryFn: () => "foo",
    }),
};
