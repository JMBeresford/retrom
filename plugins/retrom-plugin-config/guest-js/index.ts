import { invoke } from "@tauri-apps/api/core";
import { RetromClientConfig } from "../../../packages/client/web/src/generated/retrom/client/client-config";

export async function getConfig(): Promise<RetromClientConfig> {
  return invoke<RetromClientConfig>("plugin:config|get_config");
}

export async function setConfig(config: RetromClientConfig): Promise<void> {
  return invoke("plugin:config|set_config", { newConfig: config });
}
