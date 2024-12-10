import { RetromClientConfig } from "@/generated/retrom/client/client-config";
import * as ConfigFile from "retrom-plugin-config-api";
import { StateStorage } from "zustand/middleware";

export const desktopStorage: StateStorage = {
  getItem: async (key: string) => {
    const clientConfig = await ConfigFile.getConfig();
    console.log(
      "Getting config",
      key,
      clientConfig,
      JSON.stringify(clientConfig),
    );

    return JSON.stringify(clientConfig);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem: async (key: string, value: any) => {
    const parsed = JSON.parse(value);
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
