import { GetGamesRequest } from "@/generated/retrom/services";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";

export function useGames(request: Partial<GetGamesRequest>) {
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["games", "game-metadata", request, retromClient],
    queryFn: async () => await retromClient.gameClient.getGames(request),
  });
}
