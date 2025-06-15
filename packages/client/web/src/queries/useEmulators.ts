import {
  GetEmulatorsRequestSchema,
  GetEmulatorsResponse,
} from "@retrom/codegen/retrom/services/emulator-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetEmulatorsResponse) => S;

export function useEmulators<T = GetEmulatorsResponse>(
  opts: {
    request?: MessageInitShape<typeof GetEmulatorsRequestSchema>;
    selectFn?: SelectFn<T>;
    enabled?: boolean;
  } = {},
) {
  const { request = {}, selectFn, enabled } = opts;
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["emulators", request, retromClient],
    select: selectFn,
    enabled,
    queryFn: () => retromClient.emulatorClient.getEmulators(request),
  });
}
