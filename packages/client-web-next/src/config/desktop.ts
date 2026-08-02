import * as ConfigFile from "@retrom/plugin-config";
import { create, fromJsonString, toJsonString } from "@bufbuild/protobuf";
import { RetromClientConfigSchema } from "@retrom/codegen/retrom/client/v1/client_config_pb";
import type { StateStorage } from "zustand/middleware";
import type { LocalConfig } from "./store";

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

    return toJsonString(
      RetromClientConfigSchema,
      create(RetromClientConfigSchema, clientConfig),
    );
  },

  setItem: async (_key: string, value: string) => {
    const parsed = JSON.parse(value) as { state: LocalConfig };

    const config = fromJsonString(
      RetromClientConfigSchema,
      JSON.stringify(parsed.state),
      {
        ignoreUnknownFields: true,
      },
    );

    await ConfigFile.setConfig(config);
  },

  removeItem: async () => {
    await ConfigFile.setConfig({});
  },
};
