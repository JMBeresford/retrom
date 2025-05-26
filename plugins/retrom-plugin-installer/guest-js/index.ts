import {
  create,
  fromBinary,
  MessageInitShape,
  toBinary,
} from "@bufbuild/protobuf";
import {
  InstallationStateSchema,
  InstallGamePayloadSchema,
  UninstallGamePayloadSchema,
} from "@retrom/codegen/retrom/client/client-utils_pb";
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

export async function getInstallationState() {
  return invoke<number[]>("plugin:installer|get_installation_state").then(
    (res) => fromBinary(InstallationStateSchema, new Uint8Array(res)),
  );
}

export async function installGame(
  payload: MessageInitShape<typeof InstallGamePayloadSchema>,
) {
  return invoke<void>("plugin:installer|install_game", {
    payload: toBinary(
      InstallGamePayloadSchema,
      create(InstallGamePayloadSchema, payload),
    ),
  });
}

export async function uninstallGame(
  payload: MessageInitShape<typeof UninstallGamePayloadSchema>,
) {
  return invoke("plugin:installer|uninstall_game", {
    payload: toBinary(
      UninstallGamePayloadSchema,
      create(UninstallGamePayloadSchema, payload),
    ),
  });
}
