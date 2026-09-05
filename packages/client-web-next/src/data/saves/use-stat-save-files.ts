import { useQuery } from "@tanstack/react-query";
import { savesQueries } from "./queries";
import type { SavesQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  StatSaveFilesRequestSchema,
  StatSaveFilesResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator_saves_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useStatSaveFiles<TData = StatSaveFilesResponse>(
  params: {
    request?: MessageInitShape<typeof StatSaveFilesRequestSchema>;
    options?: QueryOptionsExt<
      StatSaveFilesResponse,
      ConnectError,
      TData,
      SavesQueryKey<"statSaveFiles">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(savesQueries.statSaveFiles(request, retromClient, options));
}
