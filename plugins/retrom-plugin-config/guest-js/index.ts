import {
  create,
  fromBinary,
  MessageInitShape,
  toBinary,
} from "@bufbuild/protobuf";
import {
  RetromClientConfig,
  RetromClientConfigSchema,
} from "@retrom/codegen/retrom/client/client-config_pb";
import { invoke } from "@tauri-apps/api/core";

export async function getConfig(): Promise<RetromClientConfig> {
  return invoke<number[]>("plugin:config|get_config").then((res) =>
    fromBinary(RetromClientConfigSchema, new Uint8Array(res)),
  );
}

export async function setConfig(
  config: MessageInitShape<typeof RetromClientConfigSchema>,
): Promise<void> {
  return invoke("plugin:config|set_config", {
    newConfig: toBinary(
      RetromClientConfigSchema,
      create(RetromClientConfigSchema, config),
    ),
  });
}

export async function isFlatpak(): Promise<boolean> {
  return invoke<boolean>("plugin:config|is_flatpak");
}
