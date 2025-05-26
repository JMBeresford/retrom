import { InstallationProgressUpdateSchema } from "@retrom/codegen/retrom/client/client-utils_pb";
import { installGame } from "@retrom/plugin-installer";
import { GameSchema } from "@retrom/codegen/retrom/models/games_pb";
import { GameFileSchema } from "@retrom/codegen/retrom/models/game-files_pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import { MessageInitShape, MessageShape } from "@bufbuild/protobuf";

export function useInstallGame(
  game: MessageInitShape<typeof GameSchema>,
  files: MessageInitShape<typeof GameFileSchema>[],
) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const window = getCurrentWebviewWindow();
    let unlisten: UnlistenFn;

    async function listen() {
      unlisten = await window.listen(
        "install-progress",
        (event: {
          payload: MessageShape<typeof InstallationProgressUpdateSchema>;
        }) => {
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
    mutationKey: ["installation", game.path],
    mutationFn: () => installGame({ game, files }),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["installation-state"],
      });
    },
    onError: console.error,
  });

  return { ...mutation, progress };
}
