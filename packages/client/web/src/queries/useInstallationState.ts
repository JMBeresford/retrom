import { InstallationStateSchema } from "@retrom/codegen/retrom/client/client-utils_pb";
import { getInstallationState } from "@retrom/plugin-installer";
import { checkIsDesktop } from "@/lib/env";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect } from "react";
import { create } from "@bufbuild/protobuf";

export function useInstallationStateQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: () => {
      if (!checkIsDesktop()) {
        return create(InstallationStateSchema, {});
      }

      return getInstallationState();
    },
    queryKey: ["installation-state"],
  });

  useEffect(() => {
    if (!checkIsDesktop()) return;

    const window = getCurrentWebviewWindow();
    const unlisteners: UnlistenFn[] = [];

    const invalidate = () => {
      void queryClient.invalidateQueries({
        queryKey: ["installation-state"],
      });
    };

    async function listen() {
      unlisteners.push(await window.listen("game-installed", invalidate));

      unlisteners.push(await window.listen("steam-game-installed", invalidate));
      unlisteners.push(
        await window.listen("steam-game-uninstalled", invalidate),
      );
    }

    void listen();

    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [queryClient]);

  return query;
}
