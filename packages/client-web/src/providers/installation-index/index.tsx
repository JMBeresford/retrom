import { getInstallationIndex } from "@retrom/plugin-installer";
import { checkIsDesktop } from "@/lib/env";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { create } from "@bufbuild/protobuf";
import {
  InstallationIndex,
  InstallationIndexSchema,
} from "@retrom/codegen/retrom/client/installation_pb";

const InstallationIndexContext = createContext<InstallationIndex>(
  create(InstallationIndexSchema, {}),
);

export function InstallationIndexProvider(props: PropsWithChildren) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: () => {
      if (!checkIsDesktop()) {
        return create(InstallationIndexSchema, {});
      }

      return getInstallationIndex();
    },
    queryKey: ["installation-index"],
  });

  useEffect(() => {
    if (!checkIsDesktop()) return;

    const window = getCurrentWebviewWindow();
    const unlisteners: UnlistenFn[] = [];

    const invalidate = () => {
      queryClient
        .invalidateQueries({
          queryKey: ["installation-index"],
        })
        .catch(console.error);
    };

    async function listen() {
      unlisteners.push(await window.listen("game-installed", invalidate));

      unlisteners.push(await window.listen("steam-game-installed", invalidate));
      unlisteners.push(
        await window.listen("steam-game-uninstalled", invalidate),
      );
    }

    listen().catch(console.error);

    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [queryClient]);

  return (
    <InstallationIndexContext.Provider
      value={query.data ?? create(InstallationIndexSchema, {})}
    >
      {props.children}
    </InstallationIndexContext.Provider>
  );
}

export function useInstallationIndex() {
  return useContext(InstallationIndexContext);
}
