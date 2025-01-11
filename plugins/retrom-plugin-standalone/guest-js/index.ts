import { invoke } from "@tauri-apps/api/core";

type Addr = {
  ip: string;
  port: number;
};

export async function enableStandaloneMode(): Promise<Addr | null> {
  return await invoke<[string, number]>(
    "plugin:standalone|enable_standalone_mode",
  ).then((value) => (value ? { ip: value[0], port: value[1] } : null));
}

export async function disableStandaloneMode(): Promise<void> {
  return invoke("plugin:standalone|disable_standalone_mode");
}
