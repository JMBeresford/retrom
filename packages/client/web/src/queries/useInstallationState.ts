import {
  InstallationStateJson,
  InstallationStateSchema,
} from "@retrom/codegen/retrom/client/client-utils_pb";
import { checkIsDesktop } from "@/lib/env";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect } from "react";
import { create, fromJson } from "@bufbuild/protobuf";

export function useInstallationStateQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: async () => {
      if (!checkIsDesktop()) {
        return create(InstallationStateSchema, {});
      }

      const res = await invoke<InstallationStateJson>(
        "plugin:installer|get_installation_state",
      );

      return fromJson(InstallationStateSchema, res);
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
