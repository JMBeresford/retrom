import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "./queries";
import type { GetLibrariesRequestSchema } from "@retrom/codegen/retrom/services/library/v1/library-service_pb";
import type { MessageInitShape } from "@bufbuild/protobuf";
import { useRetromClient } from "@/api-client/context";

export function useLibraries(
  request: MessageInitShape<typeof GetLibrariesRequestSchema> = {},
) {
  const retromClient = useRetromClient();

  return useQuery(libraryQueries.get(request, retromClient));
}
