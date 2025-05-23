import { create, StoreApi, UseBoundStore } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import {
  InterfaceConfig_GameListEntryImage,
  RetromClientConfig,
  RetromClientConfigSchema,
} from "@retrom/codegen/retrom/client/client-config_pb.js";
import { createContext, PropsWithChildren, useContext } from "react";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import { Timestamp } from "@bufbuild/protobuf/wkt";
import { checkIsDesktop } from "@/lib/env";
import { migrate } from "./migrations";
import { desktopStorage } from "./desktop";
import * as ConfigFile from "@retrom/plugin-config";

const STORAGE_KEY = "retrom-client-config";
export type LocalConfig = RetromClientConfig & {
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

const context = createContext<UseBoundStore<StoreApi<LocalConfig>> | undefined>(
  undefined,
);

const initialConfig: RetromClientConfig = {
  server: {
    hostname: defaultAPIHostname(),
    port: defaultAPIPort(),
    standalone: false,
  },
  config: {
    clientInfo: checkIsDesktop()
      ? undefined
      : {
          name: `retrom-web${navigator?.userAgent ? `_${navigator.userAgent}` : ""}`,
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
  try {
    const fromLegacyStorage = localStorage.getItem(STORAGE_KEY);
    if (fromLegacyStorage) {
      const parsed = JSON.parse(fromLegacyStorage) as Record<string, unknown>;

      const state = parsed?.state;
      const version = parsed?.version;

      if (state && typeof version === "number") {
        const config = migrate(state, version);
        await ConfigFile.setConfig(config);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error("Failed to migrate legacy storage", e);
  }

  const configFile = await ConfigFile.getConfig();

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
        version: 4,
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
          : createJSONStorage(() => localStorage),
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

export function useConfig<T>(selector: (state: LocalConfig) => T) {
  return useConfigStore()(selector);
}
