import { create, StoreApi, UseBoundStore } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig,
} from "@/generated/retrom/client/client-config";
import { createContext, PropsWithChildren, useContext } from "react";
import { DeepRequired } from "@/lib/utils";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import { Timestamp } from "@/generated/google/protobuf/timestamp";
import { checkIsDesktop } from "@/lib/env";
import { migrate } from "./migrations";
import { desktopStorage } from "./desktop";
import * as ConfigFile from "retrom-plugin-config-api";

const STORAGE_KEY = "retrom-client-config";
export type LocalConfig = DeepRequired<RetromClientConfig> & {
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

const context = createContext<UseBoundStore<StoreApi<LocalConfig>> | undefined>(
  undefined,
);

const initialConfig: DeepRequired<RetromClientConfig> = {
  server: {
    hostname: defaultAPIHostname(),
    port: defaultAPIPort(),
    standalone: false,
  },
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

if (checkIsDesktop()) {
  const configFile = await ConfigFile.getConfig();
  console.log("Config file", configFile);

  if (configFile) {
    Object.assign(initialConfig, configFile);
  }
}

const configStore = create<LocalConfig>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        ...initialConfig,
        _hasHydrated: !checkIsDesktop(),
        setHasHydrated: (value) => set({ _hasHydrated: value }),
      }),
      {
        name: STORAGE_KEY,
        version: 3,
        migrate,
        onRehydrateStorage: (state) => {
          return (_s, err) => {
            if (err) {
              console.error("Failed to rehydrate storage", err);
              return;
            }
            state.setHasHydrated(true);
          };
        },
        storage: checkIsDesktop()
          ? createJSONStorage(() => desktopStorage)
          : undefined,
      },
    ),
  ),
);

export function ConfigProvider(props: PropsWithChildren) {
  const { children } = props;

  return (
    <context.Provider value={configStore}>
      <WaitOnHydration>{children}</WaitOnHydration>
    </context.Provider>
  );
}

function WaitOnHydration(props: PropsWithChildren) {
  const { children } = props;
  const hasHydrated = useConfig((state) => state._hasHydrated);

  if (!hasHydrated && checkIsDesktop()) {
    return null;
  }

  return <>{children}</>;
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
