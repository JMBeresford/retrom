/* eslint-disable */
import Long from "long";
import { type CallContext, type CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "retrom";

export enum IgdbSearchType {
  GAME = 0,
  PLATFORM = 1,
  UNRECOGNIZED = -1,
}

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
  gameMetadataPopulated: GameMetadata[];
  platformMetadataPopulated: PlatformMetadata[];
}

export interface GetPlatformsRequest {
  ids: number[];
  withMetadata?: boolean | undefined;
}

export interface GetPlatformsResponse {
  platforms: Platform[];
  metadata: PlatformMetadata[];
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

export interface GetPlatformMetadataRequest {
  platformIds: number[];
}

export interface GetPlatformMetadataResponse {
  metadata: PlatformMetadata[];
}

export interface IgdbSearch {
  value: string;
}

export interface IgdbPagination {
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface IgdbFilters {
  /** map of field name to filter operation */
  filters: { [key: string]: IgdbFilters_FilterValue };
}

export enum IgdbFilters_FilterOperator {
  EQUAL = 0,
  NOT_EQUAL = 1,
  GREATER_THAN = 2,
  GREATER_THAN_OR_EQUAL = 3,
  LESS_THAN = 4,
  LESS_THAN_OR_EQUAL = 5,
  PREFIX_MATCH = 6,
  SUFFIX_MATCH = 7,
  INFIX_MATCH = 8,
  UNRECOGNIZED = -1,
}

export interface IgdbFilters_FilterValue {
  value: string;
  operator?: IgdbFilters_FilterOperator | undefined;
}

export interface IgdbFilters_FiltersEntry {
  key: string;
  value: IgdbFilters_FilterValue | undefined;
}

export interface IgdbFields {
  include?: IgdbFields_IncludeFields | undefined;
  exclude?: IgdbFields_ExcludeFields | undefined;
}

export interface IgdbFields_IncludeFields {
  value: string[];
}

export interface IgdbFields_ExcludeFields {
  value: string[];
}

export interface IgdbGameSearchQuery {
  /** the retrom game id we are searching for */
  gameId: number;
  search: IgdbSearch | undefined;
  fields?: IgdbGameSearchQuery_Fields | undefined;
  pagination?: IgdbPagination | undefined;
}

export interface IgdbGameSearchQuery_Fields {
  id?: number | undefined;
  title?:
    | string
    | undefined;
  /** IGDB id of the platform this game is for */
  platform?: number | undefined;
}

export interface GetIgdbGameSearchResultsRequest {
  query: IgdbGameSearchQuery | undefined;
}

export interface GetIgdbGameSearchResultsResponse {
  metadata: NewGameMetadata[];
}

export interface UpdateGameMetadataRequest {
  metadata: UpdatedGameMetadata[];
}

export interface UpdateGameMetadataResponse {
  metadataUpdated: GameMetadata[];
}

export interface IgdbPlatformSearchQuery {
  /** the retrom platform id we are searching for */
  platformId: number;
  search: IgdbSearch | undefined;
  fields?: IgdbPlatformSearchQuery_Fields | undefined;
  pagination?: IgdbPagination | undefined;
}

export interface IgdbPlatformSearchQuery_Fields {
  id?: number | undefined;
  name?: string | undefined;
}

export interface GetIgdbPlatformSearchResultsRequest {
  query: IgdbPlatformSearchQuery | undefined;
}

export interface GetIgdbPlatformSearchResultsResponse {
  metadata: NewPlatformMetadata[];
}

export interface UpdatePlatformMetadataRequest {
  metadata: UpdatedPlatformMetadata[];
}

export interface UpdatePlatformMetadataResponse {
  metadataUpdated: PlatformMetadata[];
}

/** Arbitrary search query for IGDB */
export interface GetIgdbSearchRequest {
  searchType: IgdbSearchType;
  search?: IgdbSearch | undefined;
  pagination?: IgdbPagination | undefined;
  filters?: IgdbFilters | undefined;
  fields?: IgdbFields | undefined;
}

export interface IgdbSearchGameResponse {
  games: NewGameMetadata[];
}

export interface IgdbSearchPlatformResponse {
  platforms: NewPlatformMetadata[];
}

export interface GetIgdbSearchResponse {
  gameMatches?: IgdbSearchGameResponse | undefined;
  platformMatches?: IgdbSearchPlatformResponse | undefined;
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
  return { gameMetadataPopulated: [], platformMetadataPopulated: [] };
}

export const UpdateLibraryMetadataResponse = {
  encode(message: UpdateLibraryMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gameMetadataPopulated) {
      GameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.platformMetadataPopulated) {
      PlatformMetadata.encode(v!, writer.uint32(18).fork()).ldelim();
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

          message.gameMetadataPopulated.push(GameMetadata.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.platformMetadataPopulated.push(PlatformMetadata.decode(reader, reader.uint32()));
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
    message.gameMetadataPopulated = object.gameMetadataPopulated?.map((e) => GameMetadata.fromPartial(e)) || [];
    message.platformMetadataPopulated = object.platformMetadataPopulated?.map((e) => PlatformMetadata.fromPartial(e)) ||
      [];
    return message;
  },
};

function createBaseGetPlatformsRequest(): GetPlatformsRequest {
  return { ids: [], withMetadata: undefined };
}

export const GetPlatformsRequest = {
  encode(message: GetPlatformsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.withMetadata !== undefined) {
      writer.uint32(16).bool(message.withMetadata);
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
        case 2:
          if (tag !== 16) {
            break;
          }

          message.withMetadata = reader.bool();
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
    message.withMetadata = object.withMetadata ?? undefined;
    return message;
  },
};

function createBaseGetPlatformsResponse(): GetPlatformsResponse {
  return { platforms: [], metadata: [] };
}

export const GetPlatformsResponse = {
  encode(message: GetPlatformsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platforms) {
      Platform.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.metadata) {
      PlatformMetadata.encode(v!, writer.uint32(18).fork()).ldelim();
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
        case 2:
          if (tag !== 18) {
            break;
          }

          message.metadata.push(PlatformMetadata.decode(reader, reader.uint32()));
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
    message.metadata = object.metadata?.map((e) => PlatformMetadata.fromPartial(e)) || [];
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

function createBaseGetPlatformMetadataRequest(): GetPlatformMetadataRequest {
  return { platformIds: [] };
}

export const GetPlatformMetadataRequest = {
  encode(message: GetPlatformMetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.platformIds) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPlatformMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPlatformMetadataRequest();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetPlatformMetadataRequest>): GetPlatformMetadataRequest {
    return GetPlatformMetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetPlatformMetadataRequest>): GetPlatformMetadataRequest {
    const message = createBaseGetPlatformMetadataRequest();
    message.platformIds = object.platformIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseGetPlatformMetadataResponse(): GetPlatformMetadataResponse {
  return { metadata: [] };
}

export const GetPlatformMetadataResponse = {
  encode(message: GetPlatformMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      PlatformMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPlatformMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPlatformMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata.push(PlatformMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetPlatformMetadataResponse>): GetPlatformMetadataResponse {
    return GetPlatformMetadataResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetPlatformMetadataResponse>): GetPlatformMetadataResponse {
    const message = createBaseGetPlatformMetadataResponse();
    message.metadata = object.metadata?.map((e) => PlatformMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseIgdbSearch(): IgdbSearch {
  return { value: "" };
}

export const IgdbSearch = {
  encode(message: IgdbSearch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== "") {
      writer.uint32(10).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbSearch {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbSearch>): IgdbSearch {
    return IgdbSearch.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbSearch>): IgdbSearch {
    const message = createBaseIgdbSearch();
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseIgdbPagination(): IgdbPagination {
  return { limit: undefined, offset: undefined };
}

export const IgdbPagination = {
  encode(message: IgdbPagination, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.limit !== undefined) {
      writer.uint32(8).int32(message.limit);
    }
    if (message.offset !== undefined) {
      writer.uint32(16).int32(message.offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbPagination {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbPagination();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.limit = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.offset = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbPagination>): IgdbPagination {
    return IgdbPagination.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbPagination>): IgdbPagination {
    const message = createBaseIgdbPagination();
    message.limit = object.limit ?? undefined;
    message.offset = object.offset ?? undefined;
    return message;
  },
};

function createBaseIgdbFilters(): IgdbFilters {
  return { filters: {} };
}

export const IgdbFilters = {
  encode(message: IgdbFilters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    Object.entries(message.filters).forEach(([key, value]) => {
      IgdbFilters_FiltersEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbFilters {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbFilters();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          const entry1 = IgdbFilters_FiltersEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.filters[entry1.key] = entry1.value;
          }
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbFilters>): IgdbFilters {
    return IgdbFilters.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbFilters>): IgdbFilters {
    const message = createBaseIgdbFilters();
    message.filters = Object.entries(object.filters ?? {}).reduce<{ [key: string]: IgdbFilters_FilterValue }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = IgdbFilters_FilterValue.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseIgdbFilters_FilterValue(): IgdbFilters_FilterValue {
  return { value: "", operator: undefined };
}

export const IgdbFilters_FilterValue = {
  encode(message: IgdbFilters_FilterValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value !== "") {
      writer.uint32(10).string(message.value);
    }
    if (message.operator !== undefined) {
      writer.uint32(16).int32(message.operator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbFilters_FilterValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbFilters_FilterValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.operator = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbFilters_FilterValue>): IgdbFilters_FilterValue {
    return IgdbFilters_FilterValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbFilters_FilterValue>): IgdbFilters_FilterValue {
    const message = createBaseIgdbFilters_FilterValue();
    message.value = object.value ?? "";
    message.operator = object.operator ?? undefined;
    return message;
  },
};

function createBaseIgdbFilters_FiltersEntry(): IgdbFilters_FiltersEntry {
  return { key: "", value: undefined };
}

export const IgdbFilters_FiltersEntry = {
  encode(message: IgdbFilters_FiltersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      IgdbFilters_FilterValue.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbFilters_FiltersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbFilters_FiltersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = IgdbFilters_FilterValue.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbFilters_FiltersEntry>): IgdbFilters_FiltersEntry {
    return IgdbFilters_FiltersEntry.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbFilters_FiltersEntry>): IgdbFilters_FiltersEntry {
    const message = createBaseIgdbFilters_FiltersEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? IgdbFilters_FilterValue.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseIgdbFields(): IgdbFields {
  return { include: undefined, exclude: undefined };
}

export const IgdbFields = {
  encode(message: IgdbFields, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.include !== undefined) {
      IgdbFields_IncludeFields.encode(message.include, writer.uint32(10).fork()).ldelim();
    }
    if (message.exclude !== undefined) {
      IgdbFields_ExcludeFields.encode(message.exclude, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbFields {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbFields();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.include = IgdbFields_IncludeFields.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.exclude = IgdbFields_ExcludeFields.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbFields>): IgdbFields {
    return IgdbFields.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbFields>): IgdbFields {
    const message = createBaseIgdbFields();
    message.include = (object.include !== undefined && object.include !== null)
      ? IgdbFields_IncludeFields.fromPartial(object.include)
      : undefined;
    message.exclude = (object.exclude !== undefined && object.exclude !== null)
      ? IgdbFields_ExcludeFields.fromPartial(object.exclude)
      : undefined;
    return message;
  },
};

function createBaseIgdbFields_IncludeFields(): IgdbFields_IncludeFields {
  return { value: [] };
}

export const IgdbFields_IncludeFields = {
  encode(message: IgdbFields_IncludeFields, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.value) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbFields_IncludeFields {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbFields_IncludeFields();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbFields_IncludeFields>): IgdbFields_IncludeFields {
    return IgdbFields_IncludeFields.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbFields_IncludeFields>): IgdbFields_IncludeFields {
    const message = createBaseIgdbFields_IncludeFields();
    message.value = object.value?.map((e) => e) || [];
    return message;
  },
};

function createBaseIgdbFields_ExcludeFields(): IgdbFields_ExcludeFields {
  return { value: [] };
}

export const IgdbFields_ExcludeFields = {
  encode(message: IgdbFields_ExcludeFields, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.value) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbFields_ExcludeFields {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbFields_ExcludeFields();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.value.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbFields_ExcludeFields>): IgdbFields_ExcludeFields {
    return IgdbFields_ExcludeFields.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbFields_ExcludeFields>): IgdbFields_ExcludeFields {
    const message = createBaseIgdbFields_ExcludeFields();
    message.value = object.value?.map((e) => e) || [];
    return message;
  },
};

function createBaseIgdbGameSearchQuery(): IgdbGameSearchQuery {
  return { gameId: 0, search: undefined, fields: undefined, pagination: undefined };
}

export const IgdbGameSearchQuery = {
  encode(message: IgdbGameSearchQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameId !== 0) {
      writer.uint32(8).int32(message.gameId);
    }
    if (message.search !== undefined) {
      IgdbSearch.encode(message.search, writer.uint32(18).fork()).ldelim();
    }
    if (message.fields !== undefined) {
      IgdbGameSearchQuery_Fields.encode(message.fields, writer.uint32(26).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      IgdbPagination.encode(message.pagination, writer.uint32(34).fork()).ldelim();
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

          message.search = IgdbSearch.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fields = IgdbGameSearchQuery_Fields.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.pagination = IgdbPagination.decode(reader, reader.uint32());
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
    message.search = (object.search !== undefined && object.search !== null)
      ? IgdbSearch.fromPartial(object.search)
      : undefined;
    message.fields = (object.fields !== undefined && object.fields !== null)
      ? IgdbGameSearchQuery_Fields.fromPartial(object.fields)
      : undefined;
    message.pagination = (object.pagination !== undefined && object.pagination !== null)
      ? IgdbPagination.fromPartial(object.pagination)
      : undefined;
    return message;
  },
};

function createBaseIgdbGameSearchQuery_Fields(): IgdbGameSearchQuery_Fields {
  return { id: undefined, title: undefined, platform: undefined };
}

export const IgdbGameSearchQuery_Fields = {
  encode(message: IgdbGameSearchQuery_Fields, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.title !== undefined) {
      writer.uint32(18).string(message.title);
    }
    if (message.platform !== undefined) {
      writer.uint32(24).uint64(message.platform);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbGameSearchQuery_Fields {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbGameSearchQuery_Fields();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.title = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.platform = longToNumber(reader.uint64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbGameSearchQuery_Fields>): IgdbGameSearchQuery_Fields {
    return IgdbGameSearchQuery_Fields.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbGameSearchQuery_Fields>): IgdbGameSearchQuery_Fields {
    const message = createBaseIgdbGameSearchQuery_Fields();
    message.id = object.id ?? undefined;
    message.title = object.title ?? undefined;
    message.platform = object.platform ?? undefined;
    return message;
  },
};

function createBaseGetIgdbGameSearchResultsRequest(): GetIgdbGameSearchResultsRequest {
  return { query: undefined };
}

export const GetIgdbGameSearchResultsRequest = {
  encode(message: GetIgdbGameSearchResultsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== undefined) {
      IgdbGameSearchQuery.encode(message.query, writer.uint32(10).fork()).ldelim();
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
    return message;
  },
};

function createBaseGetIgdbGameSearchResultsResponse(): GetIgdbGameSearchResultsResponse {
  return { metadata: [] };
}

export const GetIgdbGameSearchResultsResponse = {
  encode(message: GetIgdbGameSearchResultsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      NewGameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
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

          message.metadata.push(NewGameMetadata.decode(reader, reader.uint32()));
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
    message.metadata = object.metadata?.map((e) => NewGameMetadata.fromPartial(e)) || [];
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

function createBaseIgdbPlatformSearchQuery(): IgdbPlatformSearchQuery {
  return { platformId: 0, search: undefined, fields: undefined, pagination: undefined };
}

export const IgdbPlatformSearchQuery = {
  encode(message: IgdbPlatformSearchQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.platformId !== 0) {
      writer.uint32(8).int32(message.platformId);
    }
    if (message.search !== undefined) {
      IgdbSearch.encode(message.search, writer.uint32(18).fork()).ldelim();
    }
    if (message.fields !== undefined) {
      IgdbPlatformSearchQuery_Fields.encode(message.fields, writer.uint32(26).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      IgdbPagination.encode(message.pagination, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbPlatformSearchQuery {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbPlatformSearchQuery();
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

          message.search = IgdbSearch.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fields = IgdbPlatformSearchQuery_Fields.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.pagination = IgdbPagination.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbPlatformSearchQuery>): IgdbPlatformSearchQuery {
    return IgdbPlatformSearchQuery.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbPlatformSearchQuery>): IgdbPlatformSearchQuery {
    const message = createBaseIgdbPlatformSearchQuery();
    message.platformId = object.platformId ?? 0;
    message.search = (object.search !== undefined && object.search !== null)
      ? IgdbSearch.fromPartial(object.search)
      : undefined;
    message.fields = (object.fields !== undefined && object.fields !== null)
      ? IgdbPlatformSearchQuery_Fields.fromPartial(object.fields)
      : undefined;
    message.pagination = (object.pagination !== undefined && object.pagination !== null)
      ? IgdbPagination.fromPartial(object.pagination)
      : undefined;
    return message;
  },
};

function createBaseIgdbPlatformSearchQuery_Fields(): IgdbPlatformSearchQuery_Fields {
  return { id: undefined, name: undefined };
}

export const IgdbPlatformSearchQuery_Fields = {
  encode(message: IgdbPlatformSearchQuery_Fields, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== undefined) {
      writer.uint32(18).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbPlatformSearchQuery_Fields {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbPlatformSearchQuery_Fields();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbPlatformSearchQuery_Fields>): IgdbPlatformSearchQuery_Fields {
    return IgdbPlatformSearchQuery_Fields.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbPlatformSearchQuery_Fields>): IgdbPlatformSearchQuery_Fields {
    const message = createBaseIgdbPlatformSearchQuery_Fields();
    message.id = object.id ?? undefined;
    message.name = object.name ?? undefined;
    return message;
  },
};

function createBaseGetIgdbPlatformSearchResultsRequest(): GetIgdbPlatformSearchResultsRequest {
  return { query: undefined };
}

export const GetIgdbPlatformSearchResultsRequest = {
  encode(message: GetIgdbPlatformSearchResultsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.query !== undefined) {
      IgdbPlatformSearchQuery.encode(message.query, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetIgdbPlatformSearchResultsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetIgdbPlatformSearchResultsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.query = IgdbPlatformSearchQuery.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetIgdbPlatformSearchResultsRequest>): GetIgdbPlatformSearchResultsRequest {
    return GetIgdbPlatformSearchResultsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetIgdbPlatformSearchResultsRequest>): GetIgdbPlatformSearchResultsRequest {
    const message = createBaseGetIgdbPlatformSearchResultsRequest();
    message.query = (object.query !== undefined && object.query !== null)
      ? IgdbPlatformSearchQuery.fromPartial(object.query)
      : undefined;
    return message;
  },
};

function createBaseGetIgdbPlatformSearchResultsResponse(): GetIgdbPlatformSearchResultsResponse {
  return { metadata: [] };
}

export const GetIgdbPlatformSearchResultsResponse = {
  encode(message: GetIgdbPlatformSearchResultsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      NewPlatformMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetIgdbPlatformSearchResultsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetIgdbPlatformSearchResultsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata.push(NewPlatformMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetIgdbPlatformSearchResultsResponse>): GetIgdbPlatformSearchResultsResponse {
    return GetIgdbPlatformSearchResultsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetIgdbPlatformSearchResultsResponse>): GetIgdbPlatformSearchResultsResponse {
    const message = createBaseGetIgdbPlatformSearchResultsResponse();
    message.metadata = object.metadata?.map((e) => NewPlatformMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUpdatePlatformMetadataRequest(): UpdatePlatformMetadataRequest {
  return { metadata: [] };
}

export const UpdatePlatformMetadataRequest = {
  encode(message: UpdatePlatformMetadataRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadata) {
      UpdatedPlatformMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatePlatformMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatePlatformMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadata.push(UpdatedPlatformMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatePlatformMetadataRequest>): UpdatePlatformMetadataRequest {
    return UpdatePlatformMetadataRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatePlatformMetadataRequest>): UpdatePlatformMetadataRequest {
    const message = createBaseUpdatePlatformMetadataRequest();
    message.metadata = object.metadata?.map((e) => UpdatedPlatformMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUpdatePlatformMetadataResponse(): UpdatePlatformMetadataResponse {
  return { metadataUpdated: [] };
}

export const UpdatePlatformMetadataResponse = {
  encode(message: UpdatePlatformMetadataResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.metadataUpdated) {
      PlatformMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatePlatformMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatePlatformMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.metadataUpdated.push(PlatformMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<UpdatePlatformMetadataResponse>): UpdatePlatformMetadataResponse {
    return UpdatePlatformMetadataResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<UpdatePlatformMetadataResponse>): UpdatePlatformMetadataResponse {
    const message = createBaseUpdatePlatformMetadataResponse();
    message.metadataUpdated = object.metadataUpdated?.map((e) => PlatformMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetIgdbSearchRequest(): GetIgdbSearchRequest {
  return { searchType: 0, search: undefined, pagination: undefined, filters: undefined, fields: undefined };
}

export const GetIgdbSearchRequest = {
  encode(message: GetIgdbSearchRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.searchType !== 0) {
      writer.uint32(8).int32(message.searchType);
    }
    if (message.search !== undefined) {
      IgdbSearch.encode(message.search, writer.uint32(18).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      IgdbPagination.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    if (message.filters !== undefined) {
      IgdbFilters.encode(message.filters, writer.uint32(34).fork()).ldelim();
    }
    if (message.fields !== undefined) {
      IgdbFields.encode(message.fields, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetIgdbSearchRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetIgdbSearchRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.searchType = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.search = IgdbSearch.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.pagination = IgdbPagination.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.filters = IgdbFilters.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.fields = IgdbFields.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetIgdbSearchRequest>): GetIgdbSearchRequest {
    return GetIgdbSearchRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetIgdbSearchRequest>): GetIgdbSearchRequest {
    const message = createBaseGetIgdbSearchRequest();
    message.searchType = object.searchType ?? 0;
    message.search = (object.search !== undefined && object.search !== null)
      ? IgdbSearch.fromPartial(object.search)
      : undefined;
    message.pagination = (object.pagination !== undefined && object.pagination !== null)
      ? IgdbPagination.fromPartial(object.pagination)
      : undefined;
    message.filters = (object.filters !== undefined && object.filters !== null)
      ? IgdbFilters.fromPartial(object.filters)
      : undefined;
    message.fields = (object.fields !== undefined && object.fields !== null)
      ? IgdbFields.fromPartial(object.fields)
      : undefined;
    return message;
  },
};

function createBaseIgdbSearchGameResponse(): IgdbSearchGameResponse {
  return { games: [] };
}

export const IgdbSearchGameResponse = {
  encode(message: IgdbSearchGameResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.games) {
      NewGameMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbSearchGameResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbSearchGameResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.games.push(NewGameMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbSearchGameResponse>): IgdbSearchGameResponse {
    return IgdbSearchGameResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbSearchGameResponse>): IgdbSearchGameResponse {
    const message = createBaseIgdbSearchGameResponse();
    message.games = object.games?.map((e) => NewGameMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseIgdbSearchPlatformResponse(): IgdbSearchPlatformResponse {
  return { platforms: [] };
}

export const IgdbSearchPlatformResponse = {
  encode(message: IgdbSearchPlatformResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platforms) {
      NewPlatformMetadata.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IgdbSearchPlatformResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIgdbSearchPlatformResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platforms.push(NewPlatformMetadata.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<IgdbSearchPlatformResponse>): IgdbSearchPlatformResponse {
    return IgdbSearchPlatformResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<IgdbSearchPlatformResponse>): IgdbSearchPlatformResponse {
    const message = createBaseIgdbSearchPlatformResponse();
    message.platforms = object.platforms?.map((e) => NewPlatformMetadata.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetIgdbSearchResponse(): GetIgdbSearchResponse {
  return { gameMatches: undefined, platformMatches: undefined };
}

export const GetIgdbSearchResponse = {
  encode(message: GetIgdbSearchResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.gameMatches !== undefined) {
      IgdbSearchGameResponse.encode(message.gameMatches, writer.uint32(10).fork()).ldelim();
    }
    if (message.platformMatches !== undefined) {
      IgdbSearchPlatformResponse.encode(message.platformMatches, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetIgdbSearchResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetIgdbSearchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameMatches = IgdbSearchGameResponse.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.platformMatches = IgdbSearchPlatformResponse.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetIgdbSearchResponse>): GetIgdbSearchResponse {
    return GetIgdbSearchResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetIgdbSearchResponse>): GetIgdbSearchResponse {
    const message = createBaseGetIgdbSearchResponse();
    message.gameMatches = (object.gameMatches !== undefined && object.gameMatches !== null)
      ? IgdbSearchGameResponse.fromPartial(object.gameMatches)
      : undefined;
    message.platformMatches = (object.platformMatches !== undefined && object.platformMatches !== null)
      ? IgdbSearchPlatformResponse.fromPartial(object.platformMatches)
      : undefined;
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
    getPlatformMetadata: {
      name: "GetPlatformMetadata",
      requestType: GetPlatformMetadataRequest,
      requestStream: false,
      responseType: GetPlatformMetadataResponse,
      responseStream: false,
      options: {},
    },
    updatePlatformMetadata: {
      name: "UpdatePlatformMetadata",
      requestType: UpdatePlatformMetadataRequest,
      requestStream: false,
      responseType: UpdatePlatformMetadataResponse,
      responseStream: false,
      options: {},
    },
    getIgdbSearch: {
      name: "GetIgdbSearch",
      requestType: GetIgdbSearchRequest,
      requestStream: false,
      responseType: GetIgdbSearchResponse,
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
    getIgdbPlatformSearchResults: {
      name: "GetIgdbPlatformSearchResults",
      requestType: GetIgdbPlatformSearchResultsRequest,
      requestStream: false,
      responseType: GetIgdbPlatformSearchResultsResponse,
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
  getPlatformMetadata(
    request: GetPlatformMetadataRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetPlatformMetadataResponse>>;
  updatePlatformMetadata(
    request: UpdatePlatformMetadataRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<UpdatePlatformMetadataResponse>>;
  getIgdbSearch(
    request: GetIgdbSearchRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetIgdbSearchResponse>>;
  getIgdbGameSearchResults(
    request: GetIgdbGameSearchResultsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetIgdbGameSearchResultsResponse>>;
  getIgdbPlatformSearchResults(
    request: GetIgdbPlatformSearchResultsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetIgdbPlatformSearchResultsResponse>>;
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
  getPlatformMetadata(
    request: DeepPartial<GetPlatformMetadataRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetPlatformMetadataResponse>;
  updatePlatformMetadata(
    request: DeepPartial<UpdatePlatformMetadataRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<UpdatePlatformMetadataResponse>;
  getIgdbSearch(
    request: DeepPartial<GetIgdbSearchRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetIgdbSearchResponse>;
  getIgdbGameSearchResults(
    request: DeepPartial<GetIgdbGameSearchResultsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetIgdbGameSearchResultsResponse>;
  getIgdbPlatformSearchResults(
    request: DeepPartial<GetIgdbPlatformSearchResultsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetIgdbPlatformSearchResultsResponse>;
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
