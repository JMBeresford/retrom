import { NewClientSchema } from "@retrom/codegen/retrom/models/clients_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageInitShape } from "@bufbuild/protobuf";

export function useCreateClient() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["new-client"],
    mutationFn: (newClient: MessageInitShape<typeof NewClientSchema>) =>
      retromClient.clientsClient.createClient({ client: newClient }),
    onError: console.error,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          ["client-info", "client", "clients"].some((k) =>
            query.queryKey.includes(k),
          ),
      });
    },
  });
}
