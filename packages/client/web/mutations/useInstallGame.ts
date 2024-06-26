import { InstallationProgressUpdate } from "@/generated/retrom/client-utils";
import { Game, GameFile } from "@/generated/retrom/models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";

export function useInstallGame(game: Game, files: GameFile[]) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const window = getCurrent();
    let unlisten: UnlistenFn;

    async function listen() {
      unlisten = await window.listen(
        "install-progress",
        (event: { payload: InstallationProgressUpdate }) => {
          const { progress, gameId } = event.payload;
          if (gameId === game.id) {
            setProgress(progress);
          }
        },
      );
    }

    listen();

    return () => {
      unlisten && unlisten();
    };
  }, [game, queryClient]);

  const { mutate, status } = useMutation({
    mutationKey: ["installation", game.path, files],
    mutationFn: async () => {
      return invoke("plugin:installer|install_game", {
        payload: { game, files },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["installation-status", game.path],
      });
    },
  });

  return { mutate, status, progress };
}
