import { NewClient } from "@/generated/retrom/models/clients";
import { useRetromClient } from "@/providers/retrom-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateClient() {
  const queryClient = useQueryClient();
  const retromClient = useRetromClient();

  return useMutation({
    mutationKey: ["new-client"],
    mutationFn: (newClient: NewClient) =>
      retromClient.clientsClient.createClient({ client: newClient }),
    onError: console.error,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["client-info", "client", "clients"].some((k) =>
            query.queryKey.includes(k),
          ),
      });
    },
  });
}
