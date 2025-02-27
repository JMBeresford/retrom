import { invoke } from "@tauri-apps/api/core";

export async function openInstallationDir(gameId?: number): Promise<void> {
  return invoke("plugin:installer|open_installation_dir", { gameId });
}

export async function migrateInstallationDir(newDir: string): Promise<void> {
  return invoke("plugin:installer|migrate_installation_dir", { newDir });
}

export async function clearInstallationDir(): Promise<void> {
  return invoke("plugin:installer|clear_installation_dir");
}

export async function updateSteamInstallations(): Promise<void> {
  return invoke("plugin:installer|update_steam_installations");
}
