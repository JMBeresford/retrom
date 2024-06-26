// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.176.1
//   protoc               v5.26.1
// source: models.proto

/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "retrom";

export interface Platform {
  id: number;
  path: string;
}

export interface NewPlatform {
  path: string;
}

export interface UpdatedPlatform {
  id: number;
  path?: string | undefined;
}

export interface Game {
  id: number;
  path: string;
  platformId?: number | undefined;
}

export interface NewGame {
  path: string;
  platformId?: number | undefined;
}

export interface UpdatedGame {
  id: number;
  path?: string | undefined;
  platformId?: number | undefined;
}

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

export interface GameMetadata {
  gameId: number;
  name?: string | undefined;
  description?: string | undefined;
  coverUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  iconUrl?: string | undefined;
  igdbId?: number | undefined;
}

export interface NewGameMetadata {
  gameId?: number | undefined;
  name?: string | undefined;
  description?: string | undefined;
  coverUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  iconUrl?: string | undefined;
  igdbId?: number | undefined;
}

export interface UpdatedGameMetadata {
  gameId: number;
  name?: string | undefined;
  description?: string | undefined;
  coverUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  iconUrl?: string | undefined;
  igdbId?: number | undefined;
}

export interface PlatformMetadata {
  platformId: number;
  name?: string | undefined;
  description?: string | undefined;
  backgroundUrl?: string | undefined;
  logoUrl?: string | undefined;
  igdbId?: number | undefined;
}

export interface NewPlatformMetadata {
  platformId?: number | undefined;
  name?: string | undefined;
  description?: string | undefined;
  backgroundUrl?: string | undefined;
  logoUrl?: string | undefined;
  igdbId?: number | undefined;
}

export interface UpdatedPlatformMetadata {
  platformId: number;
  name?: string | undefined;
  description?: string | undefined;
  backgroundUrl?: string | undefined;
  logoUrl?: string | undefined;
  igdbId?: number | undefined;
}

function createBasePlatform(): Platform {
  return { id: 0, path: "" };
}

export const Platform = {
  encode(message: Platform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.path !== "") {
      writer.uint32(26).string(message.path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Platform {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatform();
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
          if (tag !== 26) {
            break;
          }

          message.path = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Platform>): Platform {
    return Platform.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Platform>): Platform {
    const message = createBasePlatform();
    message.id = object.id ?? 0;
    message.path = object.path ?? "";
    return message;
  },
};

function createBaseNewPlatform(): NewPlatform {
  return { path: "" };
}

export const NewPlatform = {
  encode(message: NewPlatform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== "") {
      writer.uint32(10).string(message.path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewPlatform {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewPlatform();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.path = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NewPlatform>): NewPlatform {
    return NewPlatform.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NewPlatform>): NewPlatform {
    const message = createBaseNewPlatform();
    message.path = object.path ?? "";
    return message;
  },
};

function createBaseUpdatedPlatform(): UpdatedPlatform {
  return { id: 0, path: undefined };
}

export const UpdatedPlatform = {
  encode(message: UpdatedPlatform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.path !== undefined) {
      writer.uint32(18).string(message.path);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatedPlatform {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatedPlatform();
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
          if (tag !== 18) {
            break;
          }

          message.path = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatedPlatform>): UpdatedPlatform {
    return UpdatedPlatform.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatedPlatform>): UpdatedPlatform {
    const message = createBaseUpdatedPlatform();
    message.id = object.id ?? 0;
    message.path = object.path ?? undefined;
    return message;
  },
};

function createBaseGame(): Game {
  return { id: 0, path: "", platformId: undefined };
}

export const Game = {
  encode(message: Game, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.path !== "") {
      writer.uint32(26).string(message.path);
    }
    if (message.platformId !== undefined) {
      writer.uint32(32).int32(message.platformId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Game {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGame();
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
          if (tag !== 26) {
            break;
          }

          message.path = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.platformId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Game>): Game {
    return Game.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Game>): Game {
    const message = createBaseGame();
    message.id = object.id ?? 0;
    message.path = object.path ?? "";
    message.platformId = object.platformId ?? undefined;
    return message;
  },
};

function createBaseNewGame(): NewGame {
  return { path: "", platformId: undefined };
}

export const NewGame = {
  encode(message: NewGame, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== "") {
      writer.uint32(10).string(message.path);
    }
    if (message.platformId !== undefined) {
      writer.uint32(16).int32(message.platformId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewGame {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewGame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.path = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.platformId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NewGame>): NewGame {
    return NewGame.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NewGame>): NewGame {
    const message = createBaseNewGame();
    message.path = object.path ?? "";
    message.platformId = object.platformId ?? undefined;
    return message;
  },
};

function createBaseUpdatedGame(): UpdatedGame {
  return { id: 0, path: undefined, platformId: undefined };
}

export const UpdatedGame = {
  encode(message: UpdatedGame, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.path !== undefined) {
      writer.uint32(18).string(message.path);
    }
    if (message.platformId !== undefined) {
      writer.uint32(24).int32(message.platformId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatedGame {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatedGame();
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
          if (tag !== 18) {
            break;
          }

          message.path = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.platformId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatedGame>): UpdatedGame {
    return UpdatedGame.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatedGame>): UpdatedGame {
    const message = createBaseUpdatedGame();
    message.id = object.id ?? 0;
    message.path = object.path ?? undefined;
    message.platformId = object.platformId ?? undefined;
    return message;
  },
};

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

function createBaseGameMetadata(): GameMetadata {
  return {
    gameId: 0,
    name: undefined,
    description: undefined,
    coverUrl: undefined,
    backgroundUrl: undefined,
    iconUrl: undefined,
    igdbId: undefined,
  };
}

export const GameMetadata = {
  encode(message: GameMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== 0) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(26).string(message.description);
    }
    if (message.coverUrl !== undefined) {
      writer.uint32(34).string(message.coverUrl);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(42).string(message.backgroundUrl);
    }
    if (message.iconUrl !== undefined) {
      writer.uint32(50).string(message.iconUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(56).int64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameMetadata();
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
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.coverUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.iconUrl = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.igdbId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameMetadata>): GameMetadata {
    return GameMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameMetadata>): GameMetadata {
    const message = createBaseGameMetadata();
    message.gameId = object.gameId ?? 0;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.coverUrl = object.coverUrl ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.iconUrl = object.iconUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
    return message;
  },
};

function createBaseNewGameMetadata(): NewGameMetadata {
  return {
    gameId: undefined,
    name: undefined,
    description: undefined,
    coverUrl: undefined,
    backgroundUrl: undefined,
    iconUrl: undefined,
    igdbId: undefined,
  };
}

export const NewGameMetadata = {
  encode(message: NewGameMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== undefined) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(26).string(message.description);
    }
    if (message.coverUrl !== undefined) {
      writer.uint32(34).string(message.coverUrl);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(42).string(message.backgroundUrl);
    }
    if (message.iconUrl !== undefined) {
      writer.uint32(50).string(message.iconUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(56).int64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewGameMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewGameMetadata();
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
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.coverUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.iconUrl = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.igdbId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NewGameMetadata>): NewGameMetadata {
    return NewGameMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NewGameMetadata>): NewGameMetadata {
    const message = createBaseNewGameMetadata();
    message.gameId = object.gameId ?? undefined;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.coverUrl = object.coverUrl ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.iconUrl = object.iconUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
    return message;
  },
};

function createBaseUpdatedGameMetadata(): UpdatedGameMetadata {
  return {
    gameId: 0,
    name: undefined,
    description: undefined,
    coverUrl: undefined,
    backgroundUrl: undefined,
    iconUrl: undefined,
    igdbId: undefined,
  };
}

export const UpdatedGameMetadata = {
  encode(message: UpdatedGameMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== 0) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(26).string(message.description);
    }
    if (message.coverUrl !== undefined) {
      writer.uint32(34).string(message.coverUrl);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(42).string(message.backgroundUrl);
    }
    if (message.iconUrl !== undefined) {
      writer.uint32(50).string(message.iconUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(56).int64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatedGameMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatedGameMetadata();
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
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.coverUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.iconUrl = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.igdbId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatedGameMetadata>): UpdatedGameMetadata {
    return UpdatedGameMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatedGameMetadata>): UpdatedGameMetadata {
    const message = createBaseUpdatedGameMetadata();
    message.gameId = object.gameId ?? 0;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.coverUrl = object.coverUrl ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.iconUrl = object.iconUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
    return message;
  },
};

function createBasePlatformMetadata(): PlatformMetadata {
  return {
    platformId: 0,
    name: undefined,
    description: undefined,
    backgroundUrl: undefined,
    logoUrl: undefined,
    igdbId: undefined,
  };
}

export const PlatformMetadata = {
  encode(message: PlatformMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.platformId !== 0) {
      writer.uint32(8).int32(message.platformId);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(26).string(message.description);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(34).string(message.backgroundUrl);
    }
    if (message.logoUrl !== undefined) {
      writer.uint32(42).string(message.logoUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(48).int64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.platformId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.logoUrl = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.igdbId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformMetadata>): PlatformMetadata {
    return PlatformMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformMetadata>): PlatformMetadata {
    const message = createBasePlatformMetadata();
    message.platformId = object.platformId ?? 0;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.logoUrl = object.logoUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
    return message;
  },
};

function createBaseNewPlatformMetadata(): NewPlatformMetadata {
  return {
    platformId: undefined,
    name: undefined,
    description: undefined,
    backgroundUrl: undefined,
    logoUrl: undefined,
    igdbId: undefined,
  };
}

export const NewPlatformMetadata = {
  encode(message: NewPlatformMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.platformId !== undefined) {
      writer.uint32(8).int32(message.platformId);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(26).string(message.description);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(34).string(message.backgroundUrl);
    }
    if (message.logoUrl !== undefined) {
      writer.uint32(42).string(message.logoUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(48).int64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NewPlatformMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewPlatformMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.platformId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.logoUrl = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.igdbId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NewPlatformMetadata>): NewPlatformMetadata {
    return NewPlatformMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NewPlatformMetadata>): NewPlatformMetadata {
    const message = createBaseNewPlatformMetadata();
    message.platformId = object.platformId ?? undefined;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.logoUrl = object.logoUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
    return message;
  },
};

function createBaseUpdatedPlatformMetadata(): UpdatedPlatformMetadata {
  return {
    platformId: 0,
    name: undefined,
    description: undefined,
    backgroundUrl: undefined,
    logoUrl: undefined,
    igdbId: undefined,
  };
}

export const UpdatedPlatformMetadata = {
  encode(message: UpdatedPlatformMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.platformId !== 0) {
      writer.uint32(8).int32(message.platformId);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(26).string(message.description);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(34).string(message.backgroundUrl);
    }
    if (message.logoUrl !== undefined) {
      writer.uint32(42).string(message.logoUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(48).int64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatedPlatformMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatedPlatformMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.platformId = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.logoUrl = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.igdbId = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatedPlatformMetadata>): UpdatedPlatformMetadata {
    return UpdatedPlatformMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatedPlatformMetadata>): UpdatedPlatformMetadata {
    const message = createBaseUpdatedPlatformMetadata();
    message.platformId = object.platformId ?? 0;
    message.name = object.name ?? undefined;
    message.description = object.description ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.logoUrl = object.logoUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
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

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
