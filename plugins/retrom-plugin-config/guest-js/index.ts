import { RetromClientConfig } from "@retrom/codegen/retrom/client/client-config_pb";
import { invoke } from "@tauri-apps/api/core";

export async function getConfig(): Promise<RetromClientConfig> {
  return invoke<RetromClientConfig>("plugin:config|get_config");
}

export async function setConfig(config: RetromClientConfig): Promise<void> {
  return invoke("plugin:config|set_config", { newConfig: config });
}
