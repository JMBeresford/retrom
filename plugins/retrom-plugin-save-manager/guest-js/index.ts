import { create, fromBinary, MessageShape, toBinary } from "@bufbuild/protobuf";
import {
  SaveSyncStatus,
  SyncEmulatorSavesResponseSchema,
  SyncEmulatorSavesPayloadSchema,
  SyncEmulatorSaveStatesPayloadSchema,
  SyncEmulatorSaveStatesResponseSchema,
} from "@retrom/codegen/retrom/client/saves_pb";
import { invoke } from "@tauri-apps/api/core";

export class SaveManagerError extends Error {
  status: SaveSyncStatus;
  emulatorId: number;

  constructor(
    status: SaveSyncStatus,
    emulatorId: number,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.status = status;
    this.emulatorId = emulatorId;
    this.name = "SaveManagerError";

    Object.setPrototypeOf(this, SaveManagerError.prototype);
  }
}

export async function getEmulatorSavesSyncStatus(emulatorId: number) {
  return await invoke<SaveSyncStatus>(
    "plugin:save-manager|get_emulator_saves_sync_status",
    {
      emulatorId,
    },
  );
}

export async function syncEmulatorSaves(
  payload: Omit<
    MessageShape<typeof SyncEmulatorSavesPayloadSchema>,
    "$typeName" | "$unknown"
  >,
) {
  const message = create(SyncEmulatorSavesPayloadSchema, payload);
  const bytes = toBinary(SyncEmulatorSavesPayloadSchema, message);

  const res = await invoke<number[]>(
    "plugin:save-manager|sync_emulator_saves",
    {
      payload: bytes,
    },
  );

  const response = fromBinary(
    SyncEmulatorSavesResponseSchema,
    new Uint8Array(res),
  );

  return response;
}

export async function getEmulatorSaveStatesSyncStatus(emulatorId: number) {
  return await invoke<SaveSyncStatus>(
    "plugin:save-manager|get_emulator_save_states_sync_status",
    {
      emulatorId,
    },
  );
}

export async function syncEmulatorSaveStates(
  payload: Omit<
    MessageShape<typeof SyncEmulatorSaveStatesPayloadSchema>,
    "$typeName" | "$unknown"
  >,
) {
  const message = create(SyncEmulatorSaveStatesPayloadSchema, payload);
  const bytes = toBinary(SyncEmulatorSaveStatesPayloadSchema, message);

  const res = await invoke<number[]>(
    "plugin:save-manager|sync_emulator_save_states",
    {
      payload: bytes,
    },
  );

  const response = fromBinary(
    SyncEmulatorSaveStatesResponseSchema,
    new Uint8Array(res),
  );

  return response;
}
