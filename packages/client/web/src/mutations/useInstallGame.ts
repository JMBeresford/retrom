import {
  InstallationProgressUpdate,
  InstallGamePayload,
} from "@retrom/codegen/retrom/client/client-utils";
import { Game } from "@retrom/codegen/retrom/models/games";
import { GameFile } from "@retrom/codegen/retrom/models/game-files";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";

export function useInstallGame(game: Game, files: GameFile[]) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const window = getCurrentWebviewWindow();
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

    listen().catch(console.error);

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [game, queryClient]);

  const mutation = useMutation({
    mutationKey: ["installation", game.path, files],
    mutationFn: () =>
      invoke<void>("plugin:installer|install_game", {
        payload: { game, files } satisfies InstallGamePayload,
      }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["installation-state"],
      });
    },
    onError: console.error,
  });

  return { ...mutation, progress };
}
