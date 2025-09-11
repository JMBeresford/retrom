import { useToast } from "@retrom/ui/hooks/use-toast";
import {
  type GetGamesResponse,
  GetGamesRequestSchema,
} from "@retrom/codegen/retrom/services/game-service_pb";
import { useRetromClient } from "@/providers/retrom-client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MessageInitShape } from "@bufbuild/protobuf";

type SelectFn<S> = (data: GetGamesResponse) => S;

export function useGames<T = GetGamesResponse>(opts: {
  request?: MessageInitShape<typeof GetGamesRequestSchema>;
  selectFn?: SelectFn<T>;
}) {
  const { request = {}, selectFn } = opts;
  const { toast } = useToast();
  const navigate = useNavigate();
  const retromClient = useRetromClient();

  return useQuery({
    queryKey: ["games", "game-metadata", "game-files", request, retromClient],
    queryFn: async () => {
      const data = await retromClient.gameClient.getGames(request);

      if (!data.games.length) {
        toast({
          title: "Your Library Is Empty",
          id: "empty-library",
          duration: Infinity,
          description: "Have you added any games to your library yet?",
          action: {
            label: "Update Library",
            onClick: () => {
              navigate({
                to: ".",
                search: (prev) => ({
                  ...prev,
                  updateLibraryModal: { open: true },
                }),
              }).catch(console.error);
            },
          },
        });
      }
      return data;
    },
    select: selectFn,
  });
}
