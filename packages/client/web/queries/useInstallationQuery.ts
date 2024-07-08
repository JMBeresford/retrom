import { InstallationStatus } from "@/generated/retrom/client-utils";
import { Game } from "@/generated/retrom/models";
import { IS_DESKTOP } from "@/lib/env";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { useEffect } from "react";

export function useInstallationQuery(game: Game) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!IS_DESKTOP) return;

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

  const query = useQuery({
    queryFn: async () => {
      try {
        if (!IS_DESKTOP) return InstallationStatus.UNRECOGNIZED;

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

  return query;
}
