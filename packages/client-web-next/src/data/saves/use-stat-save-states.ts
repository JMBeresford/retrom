import { useQuery } from "@tanstack/react-query";
import { savesQueries } from "./queries";
import type { SavesQueryKey } from "./queries";
import type { MessageInitShape } from "@bufbuild/protobuf";
import type { QueryOptionsExt } from "../common";
import type { ConnectError } from "@connectrpc/connect";
import type {
  StatSaveStatesRequestSchema,
  StatSaveStatesResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator_saves_service_pb";
import { useRetromClient } from "@/api-client/context";

export function useStatSaveStates<TData = StatSaveStatesResponse>(
  params: {
    request?: MessageInitShape<typeof StatSaveStatesRequestSchema>;
    options?: QueryOptionsExt<
      StatSaveStatesResponse,
      ConnectError,
      TData,
      SavesQueryKey<"statSaveStates">
    >;
  } = {},
) {
  const { request = {}, options = {} } = params;
  const retromClient = useRetromClient();

  return useQuery(savesQueries.statSaveStates(request, retromClient, options));
}
