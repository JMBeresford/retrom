import * as ConfigFile from "@retrom/plugin-config";
import { StateStorage } from "zustand/middleware";
import { create, fromJsonString, toJsonString } from "@bufbuild/protobuf";
import { RetromClientConfigSchema } from "@retrom/codegen/retrom/client/client-config_pb";
import { LocalConfig } from ".";

export const desktopStorage: StateStorage = {
  getItem: async (_key: string) => {
    const clientConfig = await ConfigFile.getConfig();

    console.log({ clientConfig });

    return toJsonString(
      RetromClientConfigSchema,
      create(RetromClientConfigSchema, clientConfig),
    );
  },

  setItem: async (_key: string, value: string) => {
    const parsed = JSON.parse(value) as { state: LocalConfig };
    console.log({ parsed });

    const config = fromJsonString(
      RetromClientConfigSchema,
      JSON.stringify(parsed.state),
      {
        ignoreUnknownFields: true,
      },
    );
    console.log("Setting config", parsed.state);

    await ConfigFile.setConfig(config);
  },

  removeItem: async () => {
    await ConfigFile.setConfig({});
  },
};
