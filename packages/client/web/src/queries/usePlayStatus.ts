import { GamePlayStatusUpdate } from "@retrom/codegen/retrom/client/client-utils_pb";
import { getGamePlayStatus } from "@retrom/plugin-launcher";
import { Game } from "@retrom/codegen/retrom/models/games_pb";
import { checkIsDesktop } from "@/lib/env";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect } from "react";

const queryKey = "play-status";

export function usePlayStatusQuery(game: Game) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!checkIsDesktop()) return;

    const window = getCurrentWebviewWindow();
    const listeners: UnlistenFn[] = [];

    async function listen() {
      listeners.push(
        await window.listen(
          "game-running",
          (event: { payload: GamePlayStatusUpdate }) => {
            if (event.payload.gameId === game.id) {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  [queryKey, game.path, "game-metadata"].some((key) =>
                    query.queryKey.includes(key),
                  ),
              });
            }
          },
        ),
      );

      listeners.push(
        await window.listen(
          "game-stopped",
          (event: { payload: GamePlayStatusUpdate }) => {
            if (event.payload.gameId === game.id) {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  [queryKey, game.path, "game-metadata"].some((key) =>
                    query.queryKey.includes(key),
                  ),
              });
            }
          },
        ),
      );
    }

    void listen();

    return () => {
      listeners.forEach((unlisten) => unlisten());
    };
  }, [game, queryClient]);

  const query = useQuery({
    queryFn: () => {
      if (!checkIsDesktop()) return null;

      return getGamePlayStatus({
        game,
      });
    },
    queryKey: [queryKey, game.path, game],
  });

  return query;
}
