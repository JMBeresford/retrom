import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { RetromClientConfigSchema } from "@retrom/codegen/retrom/client/v1/client_config_pb";
import { createContext, useContext } from "react";
import * as ConfigFile from "@retrom/plugin-config";
import { toJson } from "@bufbuild/protobuf";
import { TimestampSchema, timestampNow } from "@bufbuild/protobuf/wkt";
import { desktopStorage } from "./desktop";
import { migrate } from "./migrations";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import type {
  RetromClientConfig,
  RetromClientConfigJson,
} from "@retrom/codegen/retrom/client/v1/client_config_pb";
import type { StoreApi, UseBoundStore } from "zustand";
import { IS_DESKTOP } from "@/env";

const STORAGE_KEY = "retrom-client-config";
export type LocalConfig = RetromClientConfigJson;

export const context = createContext<
  UseBoundStore<StoreApi<LocalConfig>> | undefined
>(undefined);

const defaultConfig: RetromClientConfigJson = {
  server: {
    hostname: defaultAPIHostname(),
    port: defaultAPIPort(),
    standalone: false,
    installGamesInStandalone: false,
  },
  config: {
    clientInfo: IS_DESKTOP
      ? undefined
      : {
          name: `retrom-web${navigator.userAgent ? `_${navigator.userAgent}` : ""}`,
          id: "",
          createdAt: toJson(TimestampSchema, timestampNow()),
          updatedAt: toJson(TimestampSchema, timestampNow()),
        },
    interface: {
      fullscreenByDefault: false,
      fullscreenConfig: {
        gridList: {
          columns: 4,
          gap: 20,
          imageType: "GAME_LIST_ENTRY_IMAGE_COVER",
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
if (IS_DESKTOP) {
  const fromLegacyStorage = localStorage.getItem(STORAGE_KEY);
  if (fromLegacyStorage) {
    console.warn("Legacy localStorage found, this config is no longer used!");
  }

  configFile = await ConfigFile.getConfig();
  console.log("Config file loaded");
}

const initialConfig = configFile
  ? toJson(RetromClientConfigSchema, configFile)
  : defaultConfig;

export const configStore = create<LocalConfig>()(
  subscribeWithSelector(
    persist(() => initialConfig, {
      name: STORAGE_KEY,
      version: 6,
      migrate,
      skipHydration: IS_DESKTOP,
      onRehydrateStorage: (state) => {
        console.log("Rehydrating config state", state);
      },
      storage: IS_DESKTOP
        ? createJSONStorage(() => desktopStorage, {
            replacer: (_, v) => (typeof v === "bigint" ? v.toString() : v),
          })
        : createJSONStorage(() => localStorage, {
            replacer: (_, v) => (typeof v === "bigint" ? v.toString() : v),
          }),
    }),
  ),
);

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
