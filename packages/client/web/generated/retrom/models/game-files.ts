// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.176.1
//   protoc               v5.26.1
// source: models/game-files.proto

/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "retrom";

export interface GameFile {
  id: number;
  byteSize: number;
  path: string;
  gameId: number;
}

export interface NewGameFile {
  byteSize: number;
  path: string;
  gameId?: number | undefined;
}

export interface UpdatedGameFile {
  id: number;
  byteSize?: number | undefined;
  path?: string | undefined;
  gameId?: number | undefined;
}

function createBaseGameFile(): GameFile {
  return { id: 0, byteSize: 0, path: "", gameId: 0 };
}

export const GameFile = {
  encode(message: GameFile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.byteSize !== 0) {
      writer.uint32(24).int32(message.byteSize);
    }
    if (message.path !== "") {
      writer.uint32(34).string(message.path);
    }
    if (message.gameId !== 0) {
      writer.uint32(48).int32(message.gameId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameFile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameFile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.byteSize = reader.int32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.path = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.gameId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameFile>): GameFile {
    return GameFile.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameFile>): GameFile {
    const message = createBaseGameFile();
    message.id = object.id ?? 0;
    message.byteSize = object.byteSize ?? 0;
    message.path = object.path ?? "";
    message.gameId = object.gameId ?? 0;
    return message;
  },
};

function createBaseNewGameFile(): NewGameFile {
  return { byteSize: 0, path: "", gameId: undefined };
}

export const NewGameFile = {
  encode(message: NewGameFile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.byteSize !== 0) {
      writer.uint32(8).int32(message.byteSize);
    }
    if (message.path !== "") {
      writer.uint32(18).string(message.path);
    }
    if (message.gameId !== undefined) {
      writer.uint32(24).int32(message.gameId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewGameFile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewGameFile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.byteSize = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.path = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.gameId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NewGameFile>): NewGameFile {
    return NewGameFile.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NewGameFile>): NewGameFile {
    const message = createBaseNewGameFile();
    message.byteSize = object.byteSize ?? 0;
    message.path = object.path ?? "";
    message.gameId = object.gameId ?? undefined;
    return message;
  },
};

function createBaseUpdatedGameFile(): UpdatedGameFile {
  return { id: 0, byteSize: undefined, path: undefined, gameId: undefined };
}

export const UpdatedGameFile = {
  encode(message: UpdatedGameFile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.byteSize !== undefined) {
      writer.uint32(16).int32(message.byteSize);
    }
    if (message.path !== undefined) {
      writer.uint32(26).string(message.path);
    }
    if (message.gameId !== undefined) {
      writer.uint32(32).int32(message.gameId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatedGameFile {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatedGameFile();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.byteSize = reader.int32();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.path = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.gameId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatedGameFile>): UpdatedGameFile {
    return UpdatedGameFile.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatedGameFile>): UpdatedGameFile {
    const message = createBaseUpdatedGameFile();
    message.id = object.id ?? 0;
    message.byteSize = object.byteSize ?? undefined;
    message.path = object.path ?? undefined;
    message.gameId = object.gameId ?? undefined;
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
