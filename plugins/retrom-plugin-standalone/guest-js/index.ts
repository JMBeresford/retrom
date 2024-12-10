import { invoke } from "@tauri-apps/api/core";

export async function enableStandaloneMode(): Promise<number | null> {
  return await invoke<number>("plugin:standalone|enable_standalone_mode").then(
    (value) => value ?? null,
  );
}

export async function disableStandaloneMode(): Promise<void> {
  return invoke("plugin:standalone|disable_standalone_mode");
}
