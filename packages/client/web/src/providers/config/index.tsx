import { create, StoreApi, UseBoundStore } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig,
} from "@/generated/retrom/client/client-config";
import { createContext, PropsWithChildren, useContext } from "react";
import { DeepRequired } from "@/lib/utils";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import { Timestamp } from "@/generated/google/protobuf/timestamp";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { checkIsDesktop } from "@/lib/env";
import { invoke } from "@tauri-apps/api/core";
import { migrate } from "./migrations";

const STORAGE_KEY = "retrom-client-config";
export type LocalConfig = DeepRequired<RetromClientConfig>;

const context = createContext<UseBoundStore<StoreApi<LocalConfig>> | undefined>(
  undefined,
);

export function ConfigProvider(props: PropsWithChildren) {
  const { children } = props;
  const navigate = useNavigate();
  const search = useLocation({ select: (location) => location.search });

  const configStore = create<LocalConfig>()(
    subscribeWithSelector(
      persist(() => defaultConfig, {
        name: STORAGE_KEY,
        version: 2,
        migrate,
      }),
    ),
  );

  const initialConfig = configStore.getState();

  if (checkIsDesktop()) {
    updateTauriConfig(initialConfig);
    configStore.subscribe((s) => updateTauriConfig(s));
  }

  if (
    !initialConfig?.flowCompletions.setupComplete &&
    !search.setupModal?.open &&
    checkIsDesktop()
  ) {
    navigate({
      search: (prev) => {
        prev.setupModal = { open: true };

        return prev;
      },
    });

    return null;
  }

  return <context.Provider value={configStore}>{children}</context.Provider>;
}

export function useConfigStore() {
  const store = useContext(context);

  if (!store) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return store;
}

export function useConfig<U = undefined>(
  selector: (state: LocalConfig) => U extends undefined ? LocalConfig : U,
) {
  return useConfigStore()(selector);
}

export const defaultConfig: DeepRequired<RetromClientConfig> = {
  server: { hostname: defaultAPIHostname(), port: defaultAPIPort() },
  config: {
    clientInfo: {
      name: "",
      id: -1,
      createdAt: Timestamp.create(),
      updatedAt: Timestamp.create(),
    },
    interface: {
      fullscreenByDefault: false,
      fullscreenConfig: {
        gridList: {
          columns: 4,
          gap: 20,
          imageType: InterfaceConfig_GameListEntryImage.COVER,
        },
      },
    },
  },
  flowCompletions: {
    setupComplete: false,
  },
};

function updateTauriConfig(config: RetromClientConfig) {
  invoke("set_config", { newConfig: config }).catch(console.error);
}
