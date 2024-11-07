import { InstallationStatus } from "@/generated/retrom/client/client-utils";
import { Game } from "@/generated/retrom/models/games";
import { checkIsDesktop } from "@/lib/env";
import { useQueryClient } from "@tanstack/react-query";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useMemo } from "react";
import { useInstallationStateQuery } from "./useInstallationState";

export function useInstallationQuery(game: Game) {
  const queryClient = useQueryClient();
  const { data: _data, ...installationStateQuery } =
    useInstallationStateQuery();

  useEffect(() => {
    if (!checkIsDesktop()) return;

    const window = getCurrentWebviewWindow();
    let unlisten: UnlistenFn | undefined;

    async function listen() {
      unlisten = await window.listen(
        "game-installed",
        (event: { payload: number }) => {
          if (event.payload === game.id) {
            queryClient.invalidateQueries({
              queryKey: ["installation-state"],
            });
          }
        },
      );
    }

    listen();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [game, queryClient]);

  const data = useMemo(() => {
    const status =
      _data?.installationState.get(game.id) ?? InstallationStatus.UNRECOGNIZED;

    return status;
  }, [_data, game.id]);

  return {
    ...installationStateQuery,
    data,
  };
}
