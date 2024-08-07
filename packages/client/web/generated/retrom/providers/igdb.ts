// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.180.0
//   protoc               v5.27.1
// source: retrom/providers/igdb.proto

/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "retrom";

export interface IgdbSearch {
  value: string;
}

export interface IgdbPagination {
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface IgdbFilters {
  /** map of field name to filter operation */
  filters: Map<string, IgdbFilters_FilterValue>;
}

export const IgdbFilters_FilterOperator = {
  EQUAL: 0,
  NOT_EQUAL: 1,
  GREATER_THAN: 2,
  GREATER_THAN_OR_EQUAL: 3,
  LESS_THAN: 4,
  LESS_THAN_OR_EQUAL: 5,
  PREFIX_MATCH: 6,
  SUFFIX_MATCH: 7,
  INFIX_MATCH: 8,
  ANY: 9,
  ALL: 10,
  NONE: 11,
  NOT_ALL: 12,
  EXACT: 13,
  UNRECOGNIZED: -1,
} as const;

export type IgdbFilters_FilterOperator = typeof IgdbFilters_FilterOperator[keyof typeof IgdbFilters_FilterOperator];

export namespace IgdbFilters_FilterOperator {
  export type EQUAL = typeof IgdbFilters_FilterOperator.EQUAL;
  export type NOT_EQUAL = typeof IgdbFilters_FilterOperator.NOT_EQUAL;
  export type GREATER_THAN = typeof IgdbFilters_FilterOperator.GREATER_THAN;
  export type GREATER_THAN_OR_EQUAL = typeof IgdbFilters_FilterOperator.GREATER_THAN_OR_EQUAL;
  export type LESS_THAN = typeof IgdbFilters_FilterOperator.LESS_THAN;
  export type LESS_THAN_OR_EQUAL = typeof IgdbFilters_FilterOperator.LESS_THAN_OR_EQUAL;
  export type PREFIX_MATCH = typeof IgdbFilters_FilterOperator.PREFIX_MATCH;
  export type SUFFIX_MATCH = typeof IgdbFilters_FilterOperator.SUFFIX_MATCH;
  export type INFIX_MATCH = typeof IgdbFilters_FilterOperator.INFIX_MATCH;
  export type ANY = typeof IgdbFilters_FilterOperator.ANY;
  export type ALL = typeof IgdbFilters_FilterOperator.ALL;
  export type NONE = typeof IgdbFilters_FilterOperator.NONE;
  export type NOT_ALL = typeof IgdbFilters_FilterOperator.NOT_ALL;
  export type EXACT = typeof IgdbFilters_FilterOperator.EXACT;
  export type UNRECOGNIZED = typeof IgdbFilters_FilterOperator.UNRECOGNIZED;
}

export interface IgdbFilters_FilterValue {
  value: string;
  operator?: IgdbFilters_FilterOperator | undefined;
}

export interface IgdbFilters_FiltersEntry {
  key: string;
  value?: IgdbFilters_FilterValue | undefined;
}

export interface IgdbFields {
  selector?: { $case: "include"; include: IgdbFields_IncludeFields } | {
    $case: "exclude";
    exclude: IgdbFields_ExcludeFields;
  } | undefined;
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
  search?: IgdbSearch | undefined;
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

export interface IgdbPlatformSearchQuery {
  /** the retrom platform id we are searching for */
  platformId: number;
  search?: IgdbSearch | undefined;
  fields?: IgdbPlatformSearchQuery_Fields | undefined;
  pagination?: IgdbPagination | undefined;
}

export interface IgdbPlatformSearchQuery_Fields {
  id?: number | undefined;
  name?: string | undefined;
}

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
  return { filters: new Map() };
}

export const IgdbFilters = {
  encode(message: IgdbFilters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    message.filters.forEach((value, key) => {
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
            message.filters.set(entry1.key, entry1.value);
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
    message.filters = (() => {
      const m = new Map();
      (object.filters as Map<string, IgdbFilters_FilterValue> ?? new Map()).forEach((value, key) => {
        if (value !== undefined) {
          m.set(key, IgdbFilters_FilterValue.fromPartial(value));
        }
      });
      return m;
    })();
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
  return { selector: undefined };
}

export const IgdbFields = {
  encode(message: IgdbFields, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    switch (message.selector?.$case) {
      case "include":
        IgdbFields_IncludeFields.encode(message.selector.include, writer.uint32(10).fork()).ldelim();
        break;
      case "exclude":
        IgdbFields_ExcludeFields.encode(message.selector.exclude, writer.uint32(18).fork()).ldelim();
        break;
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

          message.selector = { $case: "include", include: IgdbFields_IncludeFields.decode(reader, reader.uint32()) };
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.selector = { $case: "exclude", exclude: IgdbFields_ExcludeFields.decode(reader, reader.uint32()) };
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
    if (
      object.selector?.$case === "include" &&
      object.selector?.include !== undefined &&
      object.selector?.include !== null
    ) {
      message.selector = { $case: "include", include: IgdbFields_IncludeFields.fromPartial(object.selector.include) };
    }
    if (
      object.selector?.$case === "exclude" &&
      object.selector?.exclude !== undefined &&
      object.selector?.exclude !== null
    ) {
      message.selector = { $case: "exclude", exclude: IgdbFields_ExcludeFields.fromPartial(object.selector.exclude) };
    }
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
  if (long.lt(globalThis.Number.MIN_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is smaller than Number.MIN_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
