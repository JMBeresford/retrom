import { RetromClientConfig } from "@retrom/codegen/retrom/client/client-config";
import * as ConfigFile from "@retrom/plugin-config";
import { StateStorage } from "zustand/middleware";
import { LocalConfig } from ".";

async function retry<T>(fn: () => Promise<T>, count = 5): Promise<T> {
  let attempts = 0;

  while (attempts < count) {
    try {
      const res = await fn();
      return res;
    } catch {
      attempts += 1;
    }
  }

  throw new Error("Failed to get config");
}

export const desktopStorage: StateStorage = {
  getItem: async (_key: string) => {
    const clientConfig = await retry(ConfigFile.getConfig, 5);

    return JSON.stringify(clientConfig);
  },

  setItem: async (_key: string, value: string) => {
    const parsed = JSON.parse(value) as { state: LocalConfig };

    if (!parsed.state._hasHydrated) {
      return;
    }

    await ConfigFile.setConfig(RetromClientConfig.fromJSON(parsed.state));
  },

  removeItem: async () => {
    await ConfigFile.setConfig({});
  },
};
