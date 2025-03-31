import { RetromClientConfig } from "@retrom/codegen/retrom/client/client-config";
import * as ConfigFile from "@retrom/plugin-config";
import { StateStorage } from "zustand/middleware";
import { LocalConfig } from ".";

export const desktopStorage: StateStorage = {
  getItem: async (_key: string) => {
    const clientConfig = await ConfigFile.getConfig();

    return JSON.stringify(clientConfig);
  },

  setItem: async (_key: string, value: string) => {
    const parsed = JSON.parse(value) as { state: LocalConfig };
    console.log("Setting config", parsed.state);

    if (!parsed.state._hasHydrated) {
      return;
    }

    await ConfigFile.setConfig(RetromClientConfig.fromJSON(parsed.state));
  },

  removeItem: async () => {
    await ConfigFile.setConfig({});
  },
};
