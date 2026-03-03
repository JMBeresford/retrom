import { useRetromClient } from "@/providers/retrom-client";
import { RawMessage } from "@/utils/protos";
import {
  StatSaveFilesRequest,
  StatSaveFilesResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

export function useEmulatorSaveFilesStat<
  TData,
  T extends RawMessage<StatSaveFilesRequest> = RawMessage<StatSaveFilesRequest>,
>(
  request: T,
  options?: Omit<
    UndefinedInitialDataOptions<StatSaveFilesResponse, Error, TData>,
    "queryKey" | "queryFn"
  >,
) {
  const retromClient = useRetromClient();

  return useQuery({
    ...options,
    queryFn: () => retromClient.emulatorSavesClient.statSaveFiles(request),
    queryKey: ["stat-save-files", request],
  });
}
