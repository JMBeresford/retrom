import { InstallationStatus } from "@/generated/retrom/client-utils";
import { Game } from "@/generated/retrom/models";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { useEffect } from "react";

export function useInstallationQuery(game: Game) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const window = getCurrent();
    let unlisten: UnlistenFn;

    async function listen() {
      unlisten = await window.listen(
        "game-installed",
        (event: { payload: number }) => {
          if (event.payload === game.id) {
            queryClient.invalidateQueries({
              queryKey: ["installation-status", game.path],
            });
          }
        },
      );
    }

    listen();

    return () => {
      unlisten && unlisten();
    };
  }, [game, queryClient]);

  return useQuery({
    queryFn: async () => {
      try {
        return await invoke<InstallationStatus>(
          "plugin:installer|get_game_installation_status",
          {
            gameId: game.id,
          },
        );
      } catch (error) {
        console.error(error);
      }
    },
    throwOnError: true,
    queryKey: ["installation-status", game.path],
  });
}
