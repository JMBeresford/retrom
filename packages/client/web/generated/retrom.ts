/* eslint-disable */
import Long from "long";
import { type CallContext, type CallOptions } from "nice-grpc-common";
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

export interface UpdateLibraryRequest {
}

export interface UpdateLibraryResponse {
  platformsPopulated: Platform[];
  gamesPopulated: Game[];
  gameFilesPopulated: GameFile[];
}

export interface UpdateLibraryMetadataRequest {
  overwrite?: boolean | undefined;
}

export interface UpdateLibraryMetadataResponse {
  metadataPopulated: GameMetadata[];
}

export interface GetPlatformsRequest {
  ids: number[];
}

export interface GetPlatformsResponse {
  platforms: Platform[];
}

export interface GetGamesRequest {
  platformIds: number[];
  ids: number[];
  withMetadata?: boolean | undefined;
  withFiles?: boolean | undefined;
}

export interface GetGamesResponse {
  games: Game[];
  metadata: GameMetadata[];
  gameFiles: GameFile[];
}

export interface GetGameMetadataRequest {
  gameIds: number[];
}

export interface GetGameMetadataResponse {
  metadata: GameMetadata[];
}

export interface IgdbGameSearchQuery {
  /** the retrom game id we are searching for */
  gameId: number;
  search: string;
  igdbId?: number | undefined;
  title?: string | undefined;
  platform?: string | undefined;
}

export interface GetIgdbGameSearchResultsRequest {
  query: IgdbGameSearchQuery | undefined;
  limit?: number | undefined;
}

export interface GetIgdbGameSearchResultsResponse {
  metadata: GameMetadata[];
}

export interface UpdateGameMetadataRequest {
  metadata: UpdatedGameMetadata[];
}

export interface UpdateGameMetadataResponse {
  metadataUpdated: GameMetadata[];
}

export interface DeleteLibraryRequest {
}

export interface DeleteLibraryResponse {
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
    if (message.name !== undefined) {
      writer.uint32(10).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(18).string(message.description);
    }
    if (message.coverUrl !== undefined) {
      writer.uint32(26).string(message.coverUrl);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(34).string(message.backgroundUrl);
    }
    if (message.iconUrl !== undefined) {
      writer.uint32(42).string(message.iconUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(48).int64(message.igdbId);
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
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.coverUrl = reader.string();
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

          message.iconUrl = reader.string();
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

  create(base?: DeepPartial<NewGameMetadata>): NewGameMetadata {
    return NewGameMetadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NewGameMetadata>): NewGameMetadata {
    const message = createBaseNewGameMetadata();
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
  return { name: undefined, description: undefined, backgroundUrl: undefined, logoUrl: undefined, igdbId: undefined };
}

export const NewPlatformMetadata = {
  encode(message: NewPlatformMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== undefined) {
      writer.uint32(10).string(message.name);
    }
    if (message.description !== undefined) {
      writer.uint32(18).string(message.description);
    }
    if (message.backgroundUrl !== undefined) {
      writer.uint32(26).string(message.backgroundUrl);
    }
    if (message.logoUrl !== undefined) {
      writer.uint32(34).string(message.logoUrl);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(40).int64(message.igdbId);
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
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.backgroundUrl = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.logoUrl = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
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

function createBaseUpdateLibraryRequest(): UpdateLibraryRequest {
  return {};
}

export const UpdateLibraryRequest = {
  encode(_: UpdateLibraryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateLibraryRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateLibraryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateLibraryRequest>): UpdateLibraryRequest {
    return UpdateLibraryRequest.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<UpdateLibraryRequest>): UpdateLibraryRequest {
    const message = createBaseUpdateLibraryRequest();
    return message;
  },
};

function createBaseUpdateLibraryResponse(): UpdateLibraryResponse {
  return { platformsPopulated: [], gamesPopulated: [], gameFilesPopulated: [] };
}

export const UpdateLibraryResponse = {
  encode(message: UpdateLibraryResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformsPopulated) {
      Platform.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.gamesPopulated) {
      Game.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.gameFilesPopulated) {
      GameFile.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateLibraryResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateLibraryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformsPopulated.push(Platform.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.gamesPopulated.push(Game.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.gameFilesPopulated.push(GameFile.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateLibraryResponse>): UpdateLibraryResponse {
    return UpdateLibraryResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdateLibraryResponse>): UpdateLibraryResponse {
    const message = createBaseUpdateLibraryResponse();
    message.platformsPopulated = object.platformsPopulated?.map((e) => Platform.fromPartial(e)) || [];
    message.gamesPopulated = object.gamesPopulated?.map((e) => Game.fromPartial(e)) || [];
    message.gameFilesPopulated = object.gameFilesPopulated?.map((e) => GameFile.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUpdateLibraryMetadataRequest(): UpdateLibraryMetadataRequest {
  return { overwrite: undefined };
}

export const UpdateLibraryMetadataRequest = {
  encode(message: UpdateLibraryMetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.overwrite !== undefined) {
      writer.uint32(8).bool(message.overwrite);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateLibraryMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateLibraryMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.overwrite = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateLibraryMetadataRequest>): UpdateLibraryMetadataRequest {
    return UpdateLibraryMetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdateLibraryMetadataRequest>): UpdateLibraryMetadataRequest {
    const message = createBaseUpdateLibraryMetadataRequest();
    message.overwrite = object.overwrite ?? undefined;
    return message;
  },
};

function createBaseUpdateLibraryMetadataResponse(): UpdateLibraryMetadataResponse {
  return { metadataPopulated: [] };
}

export const UpdateLibraryMetadataResponse = {
  encode(message: UpdateLibraryMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadataPopulated) {
      GameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateLibraryMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateLibraryMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadataPopulated.push(GameMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateLibraryMetadataResponse>): UpdateLibraryMetadataResponse {
    return UpdateLibraryMetadataResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdateLibraryMetadataResponse>): UpdateLibraryMetadataResponse {
    const message = createBaseUpdateLibraryMetadataResponse();
    message.metadataPopulated = object.metadataPopulated?.map((e) => GameMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetPlatformsRequest(): GetPlatformsRequest {
  return { ids: [] };
}

export const GetPlatformsRequest = {
  encode(message: GetPlatformsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPlatformsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPlatformsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.ids.push(reader.int32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.int32());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetPlatformsRequest>): GetPlatformsRequest {
    return GetPlatformsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetPlatformsRequest>): GetPlatformsRequest {
    const message = createBaseGetPlatformsRequest();
    message.ids = object.ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseGetPlatformsResponse(): GetPlatformsResponse {
  return { platforms: [] };
}

export const GetPlatformsResponse = {
  encode(message: GetPlatformsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platforms) {
      Platform.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPlatformsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPlatformsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platforms.push(Platform.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetPlatformsResponse>): GetPlatformsResponse {
    return GetPlatformsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetPlatformsResponse>): GetPlatformsResponse {
    const message = createBaseGetPlatformsResponse();
    message.platforms = object.platforms?.map((e) => Platform.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetGamesRequest(): GetGamesRequest {
  return { platformIds: [], ids: [], withMetadata: undefined, withFiles: undefined };
}

export const GetGamesRequest = {
  encode(message: GetGamesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.platformIds) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(18).fork();
    for (const v of message.ids) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.withMetadata !== undefined) {
      writer.uint32(24).bool(message.withMetadata);
    }
    if (message.withFiles !== undefined) {
      writer.uint32(32).bool(message.withFiles);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGamesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGamesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.platformIds.push(reader.int32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.platformIds.push(reader.int32());
            }

            continue;
          }

          break;
        case 2:
          if (tag === 16) {
            message.ids.push(reader.int32());

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.int32());
            }

            continue;
          }

          break;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.withMetadata = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.withFiles = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGamesRequest>): GetGamesRequest {
    return GetGamesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGamesRequest>): GetGamesRequest {
    const message = createBaseGetGamesRequest();
    message.platformIds = object.platformIds?.map((e) => e) || [];
    message.ids = object.ids?.map((e) => e) || [];
    message.withMetadata = object.withMetadata ?? undefined;
    message.withFiles = object.withFiles ?? undefined;
    return message;
  },
};

function createBaseGetGamesResponse(): GetGamesResponse {
  return { games: [], metadata: [], gameFiles: [] };
}

export const GetGamesResponse = {
  encode(message: GetGamesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.metadata) {
      GameMetadata.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.gameFiles) {
      GameFile.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGamesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGamesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.metadata.push(GameMetadata.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.gameFiles.push(GameFile.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGamesResponse>): GetGamesResponse {
    return GetGamesResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGamesResponse>): GetGamesResponse {
    const message = createBaseGetGamesResponse();
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    message.metadata = object.metadata?.map((e) => GameMetadata.fromPartial(e)) || [];
    message.gameFiles = object.gameFiles?.map((e) => GameFile.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetGameMetadataRequest(): GetGameMetadataRequest {
  return { gameIds: [] };
}

export const GetGameMetadataRequest = {
  encode(message: GetGameMetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.gameIds) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGameMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGameMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag === 8) {
            message.gameIds.push(reader.int32());

            continue;
          }

          if (tag === 10) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.gameIds.push(reader.int32());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGameMetadataRequest>): GetGameMetadataRequest {
    return GetGameMetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGameMetadataRequest>): GetGameMetadataRequest {
    const message = createBaseGetGameMetadataRequest();
    message.gameIds = object.gameIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseGetGameMetadataResponse(): GetGameMetadataResponse {
  return { metadata: [] };
}

export const GetGameMetadataResponse = {
  encode(message: GetGameMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      GameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGameMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGameMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata.push(GameMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGameMetadataResponse>): GetGameMetadataResponse {
    return GetGameMetadataResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGameMetadataResponse>): GetGameMetadataResponse {
    const message = createBaseGetGameMetadataResponse();
    message.metadata = object.metadata?.map((e) => GameMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseIgdbGameSearchQuery(): IgdbGameSearchQuery {
  return { gameId: 0, search: "", igdbId: undefined, title: undefined, platform: undefined };
}

export const IgdbGameSearchQuery = {
  encode(message: IgdbGameSearchQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== 0) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.search !== "") {
      writer.uint32(18).string(message.search);
    }
    if (message.igdbId !== undefined) {
      writer.uint32(24).uint64(message.igdbId);
    }
    if (message.title !== undefined) {
      writer.uint32(34).string(message.title);
    }
    if (message.platform !== undefined) {
      writer.uint32(42).string(message.platform);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbGameSearchQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbGameSearchQuery();
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

          message.search = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.igdbId = longToNumber(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.title = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.platform = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbGameSearchQuery>): IgdbGameSearchQuery {
    return IgdbGameSearchQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbGameSearchQuery>): IgdbGameSearchQuery {
    const message = createBaseIgdbGameSearchQuery();
    message.gameId = object.gameId ?? 0;
    message.search = object.search ?? "";
    message.igdbId = object.igdbId ?? undefined;
    message.title = object.title ?? undefined;
    message.platform = object.platform ?? undefined;
    return message;
  },
};

function createBaseGetIgdbGameSearchResultsRequest(): GetIgdbGameSearchResultsRequest {
  return { query: undefined, limit: undefined };
}

export const GetIgdbGameSearchResultsRequest = {
  encode(message: GetIgdbGameSearchResultsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== undefined) {
      IgdbGameSearchQuery.encode(message.query, writer.uint32(10).fork()).ldelim();
    }
    if (message.limit !== undefined) {
      writer.uint32(16).int32(message.limit);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetIgdbGameSearchResultsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetIgdbGameSearchResultsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query = IgdbGameSearchQuery.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.limit = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetIgdbGameSearchResultsRequest>): GetIgdbGameSearchResultsRequest {
    return GetIgdbGameSearchResultsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetIgdbGameSearchResultsRequest>): GetIgdbGameSearchResultsRequest {
    const message = createBaseGetIgdbGameSearchResultsRequest();
    message.query = (object.query !== undefined && object.query !== null)
      ? IgdbGameSearchQuery.fromPartial(object.query)
      : undefined;
    message.limit = object.limit ?? undefined;
    return message;
  },
};

function createBaseGetIgdbGameSearchResultsResponse(): GetIgdbGameSearchResultsResponse {
  return { metadata: [] };
}

export const GetIgdbGameSearchResultsResponse = {
  encode(message: GetIgdbGameSearchResultsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      GameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetIgdbGameSearchResultsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetIgdbGameSearchResultsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata.push(GameMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetIgdbGameSearchResultsResponse>): GetIgdbGameSearchResultsResponse {
    return GetIgdbGameSearchResultsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetIgdbGameSearchResultsResponse>): GetIgdbGameSearchResultsResponse {
    const message = createBaseGetIgdbGameSearchResultsResponse();
    message.metadata = object.metadata?.map((e) => GameMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUpdateGameMetadataRequest(): UpdateGameMetadataRequest {
  return { metadata: [] };
}

export const UpdateGameMetadataRequest = {
  encode(message: UpdateGameMetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      UpdatedGameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateGameMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateGameMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata.push(UpdatedGameMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateGameMetadataRequest>): UpdateGameMetadataRequest {
    return UpdateGameMetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdateGameMetadataRequest>): UpdateGameMetadataRequest {
    const message = createBaseUpdateGameMetadataRequest();
    message.metadata = object.metadata?.map((e) => UpdatedGameMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUpdateGameMetadataResponse(): UpdateGameMetadataResponse {
  return { metadataUpdated: [] };
}

export const UpdateGameMetadataResponse = {
  encode(message: UpdateGameMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadataUpdated) {
      GameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateGameMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateGameMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadataUpdated.push(GameMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdateGameMetadataResponse>): UpdateGameMetadataResponse {
    return UpdateGameMetadataResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdateGameMetadataResponse>): UpdateGameMetadataResponse {
    const message = createBaseUpdateGameMetadataResponse();
    message.metadataUpdated = object.metadataUpdated?.map((e) => GameMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDeleteLibraryRequest(): DeleteLibraryRequest {
  return {};
}

export const DeleteLibraryRequest = {
  encode(_: DeleteLibraryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteLibraryRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteLibraryRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<DeleteLibraryRequest>): DeleteLibraryRequest {
    return DeleteLibraryRequest.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<DeleteLibraryRequest>): DeleteLibraryRequest {
    const message = createBaseDeleteLibraryRequest();
    return message;
  },
};

function createBaseDeleteLibraryResponse(): DeleteLibraryResponse {
  return {};
}

export const DeleteLibraryResponse = {
  encode(_: DeleteLibraryResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteLibraryResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteLibraryResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<DeleteLibraryResponse>): DeleteLibraryResponse {
    return DeleteLibraryResponse.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<DeleteLibraryResponse>): DeleteLibraryResponse {
    const message = createBaseDeleteLibraryResponse();
    return message;
  },
};

export type LibraryServiceDefinition = typeof LibraryServiceDefinition;
export const LibraryServiceDefinition = {
  name: "LibraryService",
  fullName: "retrom.LibraryService",
  methods: {
    updateLibrary: {
      name: "UpdateLibrary",
      requestType: UpdateLibraryRequest,
      requestStream: false,
      responseType: UpdateLibraryResponse,
      responseStream: false,
      options: {},
    },
    updateLibraryMetadata: {
      name: "UpdateLibraryMetadata",
      requestType: UpdateLibraryMetadataRequest,
      requestStream: false,
      responseType: UpdateLibraryMetadataResponse,
      responseStream: false,
      options: {},
    },
    deleteLibrary: {
      name: "DeleteLibrary",
      requestType: DeleteLibraryRequest,
      requestStream: false,
      responseType: DeleteLibraryResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface LibraryServiceImplementation<CallContextExt = {}> {
  updateLibrary(
    request: UpdateLibraryRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<UpdateLibraryResponse>>;
  updateLibraryMetadata(
    request: UpdateLibraryMetadataRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<UpdateLibraryMetadataResponse>>;
  deleteLibrary(
    request: DeleteLibraryRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<DeleteLibraryResponse>>;
}

export interface LibraryServiceClient<CallOptionsExt = {}> {
  updateLibrary(
    request: DeepPartial<UpdateLibraryRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<UpdateLibraryResponse>;
  updateLibraryMetadata(
    request: DeepPartial<UpdateLibraryMetadataRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<UpdateLibraryMetadataResponse>;
  deleteLibrary(
    request: DeepPartial<DeleteLibraryRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<DeleteLibraryResponse>;
}

export type PlatformServiceDefinition = typeof PlatformServiceDefinition;
export const PlatformServiceDefinition = {
  name: "PlatformService",
  fullName: "retrom.PlatformService",
  methods: {
    getPlatforms: {
      name: "GetPlatforms",
      requestType: GetPlatformsRequest,
      requestStream: false,
      responseType: GetPlatformsResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface PlatformServiceImplementation<CallContextExt = {}> {
  getPlatforms(
    request: GetPlatformsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetPlatformsResponse>>;
}

export interface PlatformServiceClient<CallOptionsExt = {}> {
  getPlatforms(
    request: DeepPartial<GetPlatformsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetPlatformsResponse>;
}

export type GameServiceDefinition = typeof GameServiceDefinition;
export const GameServiceDefinition = {
  name: "GameService",
  fullName: "retrom.GameService",
  methods: {
    getGames: {
      name: "GetGames",
      requestType: GetGamesRequest,
      requestStream: false,
      responseType: GetGamesResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface GameServiceImplementation<CallContextExt = {}> {
  getGames(request: GetGamesRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetGamesResponse>>;
}

export interface GameServiceClient<CallOptionsExt = {}> {
  getGames(request: DeepPartial<GetGamesRequest>, options?: CallOptions & CallOptionsExt): Promise<GetGamesResponse>;
}

export type MetadataServiceDefinition = typeof MetadataServiceDefinition;
export const MetadataServiceDefinition = {
  name: "MetadataService",
  fullName: "retrom.MetadataService",
  methods: {
    getGameMetadata: {
      name: "GetGameMetadata",
      requestType: GetGameMetadataRequest,
      requestStream: false,
      responseType: GetGameMetadataResponse,
      responseStream: false,
      options: {},
    },
    updateGameMetadata: {
      name: "UpdateGameMetadata",
      requestType: UpdateGameMetadataRequest,
      requestStream: false,
      responseType: UpdateGameMetadataResponse,
      responseStream: false,
      options: {},
    },
    getIgdbGameSearchResults: {
      name: "GetIgdbGameSearchResults",
      requestType: GetIgdbGameSearchResultsRequest,
      requestStream: false,
      responseType: GetIgdbGameSearchResultsResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface MetadataServiceImplementation<CallContextExt = {}> {
  getGameMetadata(
    request: GetGameMetadataRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetGameMetadataResponse>>;
  updateGameMetadata(
    request: UpdateGameMetadataRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<UpdateGameMetadataResponse>>;
  getIgdbGameSearchResults(
    request: GetIgdbGameSearchResultsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetIgdbGameSearchResultsResponse>>;
}

export interface MetadataServiceClient<CallOptionsExt = {}> {
  getGameMetadata(
    request: DeepPartial<GetGameMetadataRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetGameMetadataResponse>;
  updateGameMetadata(
    request: DeepPartial<UpdateGameMetadataRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<UpdateGameMetadataResponse>;
  getIgdbGameSearchResults(
    request: DeepPartial<GetIgdbGameSearchResultsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetIgdbGameSearchResultsResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
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
