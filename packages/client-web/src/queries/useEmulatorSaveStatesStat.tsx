import { useRetromClient } from "@/providers/retrom-client";
import { RawMessage } from "@/utils/protos";
import {
  StatSaveStatesRequest,
  StatSaveStatesResponse,
} from "@retrom/codegen/retrom/services/saves/v2/emulator-saves-service_pb";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

export function useEmulatorSaveStatesStat<
  TData,
  T extends
    RawMessage<StatSaveStatesRequest> = RawMessage<StatSaveStatesRequest>,
>(
  request: T,
  options?: Omit<
    UndefinedInitialDataOptions<StatSaveStatesResponse, Error, TData>,
    "queryKey" | "queryFn"
  >,
) {
  const retromClient = useRetromClient();

  return useQuery({
    ...options,
    queryFn: () => retromClient.emulatorSavesClient.statSaveStates(request),
    queryKey: ["stat-save-states", request],
  });
}
