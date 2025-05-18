import { create, StoreApi, UseBoundStore } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import {
  RetromClientConfig,
  RetromClientConfigJson,
  RetromClientConfigSchema,
} from "@retrom/codegen/retrom/client/client-config_pb";
import { createContext, PropsWithChildren, useContext } from "react";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import { checkIsDesktop } from "@/lib/env";
import { migrate } from "./migrations";
import { desktopStorage } from "./desktop";
import * as ConfigFile from "@retrom/plugin-config";
import { toJson } from "@bufbuild/protobuf";
import { timestampNow, TimestampSchema } from "@bufbuild/protobuf/wkt";

const STORAGE_KEY = "retrom-client-config";
export type LocalConfig = RetromClientConfigJson;

const context = createContext<UseBoundStore<StoreApi<LocalConfig>> | undefined>(
  undefined,
);

const defaultConfig: RetromClientConfigJson = {
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
          createdAt: toJson(TimestampSchema, timestampNow()),
          updatedAt: toJson(TimestampSchema, timestampNow()),
        },
    interface: {
      fullscreenByDefault: false,
      fullscreenConfig: {
        gridList: {
          columns: 4,
          gap: 20,
          imageType: "COVER",
        },
      },
    },
  },
  flowCompletions: {
    setupComplete: false,
    telemetryEnabled: false,
  },
  telemetry: {
    enabled: false,
  },
};

let configFile: RetromClientConfig | undefined;
if (checkIsDesktop()) {
  const fromLegacyStorage = localStorage.getItem(STORAGE_KEY);
  if (fromLegacyStorage) {
    console.warn("Legacy localStorage found, this config is no longer used!");
  }

  configFile = await ConfigFile.getConfig();
  console.log("Config file loaded", configFile);
}

const initialConfig = configFile
  ? toJson(RetromClientConfigSchema, configFile)
  : defaultConfig;

export const configStore = create<LocalConfig>()(
  subscribeWithSelector(
    persist(() => initialConfig, {
      name: STORAGE_KEY,
      version: 5,
      migrate,
      skipHydration: checkIsDesktop(),
      onRehydrateStorage: (state) => {
        console.log("Rehydrating config state", state);
      },
      storage: checkIsDesktop()
        ? createJSONStorage(() => desktopStorage, {
            replacer: (_, v) => {
              console.log(v);
              return typeof v === "bigint" ? v.toString() : v;
            },
          })
        : createJSONStorage(() => localStorage, {
            replacer: (_, v) => (typeof v === "bigint" ? v.toString() : v),
          }),
    }),
  ),
);

export function ConfigProvider(props: PropsWithChildren) {
  const { children } = props;

  return <context.Provider value={configStore}>{children}</context.Provider>;
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
