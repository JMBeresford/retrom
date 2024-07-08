// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.180.0
//   protoc               v5.27.1
// source: client-utils.proto

/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { EmulatorProfile } from "./models/emulators";
import { GameFile } from "./models/game-files";
import { Game } from "./models/games";

export const protobufPackage = "retrom";

export const InstallationStatus = { INSTALLED: 0, INSTALLING: 1, NOT_INSTALLED: 2, UNRECOGNIZED: -1 } as const;

export type InstallationStatus = typeof InstallationStatus[keyof typeof InstallationStatus];

export namespace InstallationStatus {
  export type INSTALLED = typeof InstallationStatus.INSTALLED;
  export type INSTALLING = typeof InstallationStatus.INSTALLING;
  export type NOT_INSTALLED = typeof InstallationStatus.NOT_INSTALLED;
  export type UNRECOGNIZED = typeof InstallationStatus.UNRECOGNIZED;
}

export const PlayStatus = { PLAYING: 0, NOT_PLAYING: 1, UNRECOGNIZED: -1 } as const;

export type PlayStatus = typeof PlayStatus[keyof typeof PlayStatus];

export namespace PlayStatus {
  export type PLAYING = typeof PlayStatus.PLAYING;
  export type NOT_PLAYING = typeof PlayStatus.NOT_PLAYING;
  export type UNRECOGNIZED = typeof PlayStatus.UNRECOGNIZED;
}

export interface InstallationProgressUpdate {
  gameId: number;
  progress: number;
}

export interface InstallGamePayload {
  game?: Game | undefined;
  files: GameFile[];
}

export interface UninstallGamePayload {
  game?: Game | undefined;
}

export interface PlayGamePayload {
  game?: Game | undefined;
  emulatorProfile?: EmulatorProfile | undefined;
}

export interface StopGamePayload {
  game?: Game | undefined;
}

export interface GetGamePlayStatusPayload {
  game?: Game | undefined;
}

export interface GamePlayStatusUpdate {
  gameId: number;
  playStatus: PlayStatus;
}

function createBaseInstallationProgressUpdate(): InstallationProgressUpdate {
  return { gameId: 0, progress: 0 };
}

export const InstallationProgressUpdate = {
  encode(message: InstallationProgressUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== 0) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.progress !== 0) {
      writer.uint32(16).uint32(message.progress);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstallationProgressUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstallationProgressUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.gameId = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.progress = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<InstallationProgressUpdate>): InstallationProgressUpdate {
    return InstallationProgressUpdate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<InstallationProgressUpdate>): InstallationProgressUpdate {
    const message = createBaseInstallationProgressUpdate();
    message.gameId = object.gameId ?? 0;
    message.progress = object.progress ?? 0;
    return message;
  },
};

function createBaseInstallGamePayload(): InstallGamePayload {
  return { game: undefined, files: [] };
}

export const InstallGamePayload = {
  encode(message: InstallGamePayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.files) {
      GameFile.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InstallGamePayload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInstallGamePayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.files.push(GameFile.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<InstallGamePayload>): InstallGamePayload {
    return InstallGamePayload.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<InstallGamePayload>): InstallGamePayload {
    const message = createBaseInstallGamePayload();
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.files = object.files?.map((e) => GameFile.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUninstallGamePayload(): UninstallGamePayload {
  return { game: undefined };
}

export const UninstallGamePayload = {
  encode(message: UninstallGamePayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UninstallGamePayload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUninstallGamePayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UninstallGamePayload>): UninstallGamePayload {
    return UninstallGamePayload.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UninstallGamePayload>): UninstallGamePayload {
    const message = createBaseUninstallGamePayload();
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    return message;
  },
};

function createBasePlayGamePayload(): PlayGamePayload {
  return { game: undefined, emulatorProfile: undefined };
}

export const PlayGamePayload = {
  encode(message: PlayGamePayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(10).fork()).ldelim();
    }
    if (message.emulatorProfile !== undefined) {
      EmulatorProfile.encode(message.emulatorProfile, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayGamePayload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayGamePayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.emulatorProfile = EmulatorProfile.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlayGamePayload>): PlayGamePayload {
    return PlayGamePayload.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlayGamePayload>): PlayGamePayload {
    const message = createBasePlayGamePayload();
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.emulatorProfile = (object.emulatorProfile !== undefined && object.emulatorProfile !== null)
      ? EmulatorProfile.fromPartial(object.emulatorProfile)
      : undefined;
    return message;
  },
};

function createBaseStopGamePayload(): StopGamePayload {
  return { game: undefined };
}

export const StopGamePayload = {
  encode(message: StopGamePayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StopGamePayload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStopGamePayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<StopGamePayload>): StopGamePayload {
    return StopGamePayload.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<StopGamePayload>): StopGamePayload {
    const message = createBaseStopGamePayload();
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    return message;
  },
};

function createBaseGetGamePlayStatusPayload(): GetGamePlayStatusPayload {
  return { game: undefined };
}

export const GetGamePlayStatusPayload = {
  encode(message: GetGamePlayStatusPayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGamePlayStatusPayload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGamePlayStatusPayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGamePlayStatusPayload>): GetGamePlayStatusPayload {
    return GetGamePlayStatusPayload.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGamePlayStatusPayload>): GetGamePlayStatusPayload {
    const message = createBaseGetGamePlayStatusPayload();
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    return message;
  },
};

function createBaseGamePlayStatusUpdate(): GamePlayStatusUpdate {
  return { gameId: 0, playStatus: 0 };
}

export const GamePlayStatusUpdate = {
  encode(message: GamePlayStatusUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== 0) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.playStatus !== 0) {
      writer.uint32(16).int32(message.playStatus);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GamePlayStatusUpdate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGamePlayStatusUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.gameId = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.playStatus = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GamePlayStatusUpdate>): GamePlayStatusUpdate {
    return GamePlayStatusUpdate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GamePlayStatusUpdate>): GamePlayStatusUpdate {
    const message = createBaseGamePlayStatusUpdate();
    message.gameId = object.gameId ?? 0;
    message.playStatus = object.playStatus ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;
