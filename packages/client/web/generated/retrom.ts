/* eslint-disable */
import Long from "long";
import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "retrom";

export enum ItemType {
  PLATFORM = 0,
  GAME = 1,
  GAME_FILE = 2,
  UNRECOGNIZED = -1,
}

export interface UpdateLibraryRequest {
  overwrite?: boolean | undefined;
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
  metadataPopulated: Metadata[];
}

export interface Platform {
  id: string;
  name: string;
  path: string;
}

export interface Game {
  id: string;
  name: string;
  path: string;
  platformId: string;
}

export interface GameFile {
  id: string;
  name: string;
  byteSize: number;
  path: string;
  hash: string;
  gameId: string;
}

export interface Metadata {
  gameId: string;
  description?: string | undefined;
  coverUrl?: string | undefined;
  backgroundUrl?: string | undefined;
  iconUrl?: string | undefined;
  igdbId?: number | undefined;
}

export interface GetPlatformsRequest {
  ids: string[];
}

export interface GetPlatformsResponse {
  platforms: Platform[];
}

export interface GetGamesRequest {
  platformIds: string[];
  ids: string[];
  withMetadata?: boolean | undefined;
  withFiles?: boolean | undefined;
}

export interface GetGamesResponse {
  games: Game[];
  metadata: Metadata[];
  gameFiles: GameFile[];
}

export interface GetMetadataRequest {
  gameId: string;
}

export interface GetMetadataResponse {
  metadata: Metadata | undefined;
}

function createBaseUpdateLibraryRequest(): UpdateLibraryRequest {
  return { overwrite: undefined };
}

export const UpdateLibraryRequest = {
  encode(message: UpdateLibraryRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.overwrite !== undefined) {
      writer.uint32(8).bool(message.overwrite);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateLibraryRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateLibraryRequest();
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

  create(base?: DeepPartial<UpdateLibraryRequest>): UpdateLibraryRequest {
    return UpdateLibraryRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdateLibraryRequest>): UpdateLibraryRequest {
    const message = createBaseUpdateLibraryRequest();
    message.overwrite = object.overwrite ?? undefined;
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
      Metadata.encode(v!, writer.uint32(10).fork()).ldelim();
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

          message.metadataPopulated.push(Metadata.decode(reader, reader.uint32()));
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
    message.metadataPopulated = object.metadataPopulated?.map((e) => Metadata.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatform(): Platform {
  return { id: "", name: "", path: "" };
}

export const Platform = {
  encode(message: Platform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
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
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
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
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.path = object.path ?? "";
    return message;
  },
};

function createBaseGame(): Game {
  return { id: "", name: "", path: "", platformId: "" };
}

export const Game = {
  encode(message: Game, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.path !== "") {
      writer.uint32(26).string(message.path);
    }
    if (message.platformId !== "") {
      writer.uint32(34).string(message.platformId);
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
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
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

          message.path = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.platformId = reader.string();
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
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.path = object.path ?? "";
    message.platformId = object.platformId ?? "";
    return message;
  },
};

function createBaseGameFile(): GameFile {
  return { id: "", name: "", byteSize: 0, path: "", hash: "", gameId: "" };
}

export const GameFile = {
  encode(message: GameFile, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.byteSize !== 0) {
      writer.uint32(24).int32(message.byteSize);
    }
    if (message.path !== "") {
      writer.uint32(34).string(message.path);
    }
    if (message.hash !== "") {
      writer.uint32(42).string(message.hash);
    }
    if (message.gameId !== "") {
      writer.uint32(50).string(message.gameId);
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
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
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
        case 5:
          if (tag !== 42) {
            break;
          }

          message.hash = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.gameId = reader.string();
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
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.byteSize = object.byteSize ?? 0;
    message.path = object.path ?? "";
    message.hash = object.hash ?? "";
    message.gameId = object.gameId ?? "";
    return message;
  },
};

function createBaseMetadata(): Metadata {
  return {
    gameId: "",
    description: undefined,
    coverUrl: undefined,
    backgroundUrl: undefined,
    iconUrl: undefined,
    igdbId: undefined,
  };
}

export const Metadata = {
  encode(message: Metadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== "") {
      writer.uint32(10).string(message.gameId);
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
      writer.uint32(48).uint64(message.igdbId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Metadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameId = reader.string();
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

          message.igdbId = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Metadata>): Metadata {
    return Metadata.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Metadata>): Metadata {
    const message = createBaseMetadata();
    message.gameId = object.gameId ?? "";
    message.description = object.description ?? undefined;
    message.coverUrl = object.coverUrl ?? undefined;
    message.backgroundUrl = object.backgroundUrl ?? undefined;
    message.iconUrl = object.iconUrl ?? undefined;
    message.igdbId = object.igdbId ?? undefined;
    return message;
  },
};

function createBaseGetPlatformsRequest(): GetPlatformsRequest {
  return { ids: [] };
}

export const GetPlatformsRequest = {
  encode(message: GetPlatformsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.ids) {
      writer.uint32(10).string(v!);
    }
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
          if (tag !== 10) {
            break;
          }

          message.ids.push(reader.string());
          continue;
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
    for (const v of message.platformIds) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.ids) {
      writer.uint32(18).string(v!);
    }
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
          if (tag !== 10) {
            break;
          }

          message.platformIds.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.ids.push(reader.string());
          continue;
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
      Metadata.encode(v!, writer.uint32(18).fork()).ldelim();
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

          message.metadata.push(Metadata.decode(reader, reader.uint32()));
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
    message.metadata = object.metadata?.map((e) => Metadata.fromPartial(e)) || [];
    message.gameFiles = object.gameFiles?.map((e) => GameFile.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetMetadataRequest(): GetMetadataRequest {
  return { gameId: "" };
}

export const GetMetadataRequest = {
  encode(message: GetMetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== "") {
      writer.uint32(10).string(message.gameId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetMetadataRequest>): GetMetadataRequest {
    return GetMetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetMetadataRequest>): GetMetadataRequest {
    const message = createBaseGetMetadataRequest();
    message.gameId = object.gameId ?? "";
    return message;
  },
};

function createBaseGetMetadataResponse(): GetMetadataResponse {
  return { metadata: undefined };
}

export const GetMetadataResponse = {
  encode(message: GetMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.metadata !== undefined) {
      Metadata.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata = Metadata.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetMetadataResponse>): GetMetadataResponse {
    return GetMetadataResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetMetadataResponse>): GetMetadataResponse {
    const message = createBaseGetMetadataResponse();
    message.metadata = (object.metadata !== undefined && object.metadata !== null)
      ? Metadata.fromPartial(object.metadata)
      : undefined;
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
    getMetadata: {
      name: "GetMetadata",
      requestType: GetMetadataRequest,
      requestStream: false,
      responseType: GetMetadataResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface MetadataServiceImplementation<CallContextExt = {}> {
  getMetadata(
    request: GetMetadataRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetMetadataResponse>>;
}

export interface MetadataServiceClient<CallOptionsExt = {}> {
  getMetadata(
    request: DeepPartial<GetMetadataRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetMetadataResponse>;
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
