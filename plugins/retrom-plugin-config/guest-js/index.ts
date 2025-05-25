import { RetromClientConfigJson } from "@retrom/codegen/retrom/client/client-config_pb";
import { invoke } from "@tauri-apps/api/core";

export async function getConfig(): Promise<RetromClientConfigJson> {
  return invoke<RetromClientConfigJson>("plugin:config|get_config");
}

export async function setConfig(config: RetromClientConfigJson): Promise<void> {
  return invoke("plugin:config|set_config", { newConfig: config });
}
