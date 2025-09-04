import {
  create,
  fromBinary,
  MessageInitShape,
  toBinary,
} from "@bufbuild/protobuf";
import {
  GetInstallationStatusPayloadSchema,
  GetInstallationStatusResponse,
  GetInstallationStatusResponseSchema,
  InstallationIndex,
  InstallationIndexSchema,
  InstallationProgressUpdate,
  InstallGamePayloadSchema,
  UninstallGamePayloadSchema,
} from "@retrom/codegen/retrom/client/installation_pb";
import {
  Channel,
  InvokeArgs,
  invoke as invokeImpl,
  InvokeOptions,
} from "@tauri-apps/api/core";

const invoke = <TOutput>(
  method: `plugin:installer|${string}`,
  args?: InvokeArgs,
  options?: InvokeOptions,
) => invokeImpl<TOutput>(method, args, options);

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

export async function getInstallationIndex(): Promise<InstallationIndex> {
  return invoke<number[]>("plugin:installer|get_installation_index").then(
    (res) => fromBinary(InstallationIndexSchema, new Uint8Array(res)),
  );
}

export async function getInstallationStatus(
  payload: MessageInitShape<typeof GetInstallationStatusPayloadSchema>,
): Promise<GetInstallationStatusResponse> {
  return invoke<number[]>("plugin:installer|get_installation_status", {
    payload: toBinary(
      GetInstallationStatusPayloadSchema,
      create(GetInstallationStatusPayloadSchema, payload),
    ),
  }).then((res) =>
    fromBinary(GetInstallationStatusResponseSchema, new Uint8Array(res)),
  );
}

export async function subscribeToInstallationUpdates<
  TCallback extends (update: InstallationProgressUpdate) => unknown,
>(onMessage: TCallback) {
  const channel = new Channel<InstallationProgressUpdate>((v) => {
    console.log({ v });
    onMessage(v);
  });

  console.log("Subscribing to installation updates");
  await invoke("plugin:installer|subscribe_to_installation_updates", {
    channel,
  });

  return channel;
}

export async function unsubscribeFromInstallationUpdates(
  channel: Channel<InstallationProgressUpdate> | number,
) {
  const channelId = typeof channel === "number" ? channel : channel.id;
  return invoke("plugin:installer|unsubscribe_from_installation_updates", {
    channelId,
  });
}

export async function installGame(
  payload: MessageInitShape<typeof InstallGamePayloadSchema>,
): Promise<void> {
  return invoke<void>("plugin:installer|install_game", {
    payload: toBinary(
      InstallGamePayloadSchema,
      create(InstallGamePayloadSchema, payload),
    ),
  });
}

export async function uninstallGame(
  payload: MessageInitShape<typeof UninstallGamePayloadSchema>,
): Promise<void> {
  return invoke<void>("plugin:installer|uninstall_game", {
    payload: toBinary(
      UninstallGamePayloadSchema,
      create(UninstallGamePayloadSchema, payload),
    ),
  });
}
