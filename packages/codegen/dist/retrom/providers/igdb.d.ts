import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "retrom";
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
export declare const IgdbFilters_FilterOperator: {
    readonly EQUAL: 0;
    readonly NOT_EQUAL: 1;
    readonly GREATER_THAN: 2;
    readonly GREATER_THAN_OR_EQUAL: 3;
    readonly LESS_THAN: 4;
    readonly LESS_THAN_OR_EQUAL: 5;
    readonly PREFIX_MATCH: 6;
    readonly SUFFIX_MATCH: 7;
    readonly INFIX_MATCH: 8;
    readonly ANY: 9;
    readonly ALL: 10;
    readonly NONE: 11;
    readonly NOT_ALL: 12;
    readonly EXACT: 13;
    readonly UNRECOGNIZED: -1;
};
export type IgdbFilters_FilterOperator = typeof IgdbFilters_FilterOperator[keyof typeof IgdbFilters_FilterOperator];
export declare namespace IgdbFilters_FilterOperator {
    type EQUAL = typeof IgdbFilters_FilterOperator.EQUAL;
    type NOT_EQUAL = typeof IgdbFilters_FilterOperator.NOT_EQUAL;
    type GREATER_THAN = typeof IgdbFilters_FilterOperator.GREATER_THAN;
    type GREATER_THAN_OR_EQUAL = typeof IgdbFilters_FilterOperator.GREATER_THAN_OR_EQUAL;
    type LESS_THAN = typeof IgdbFilters_FilterOperator.LESS_THAN;
    type LESS_THAN_OR_EQUAL = typeof IgdbFilters_FilterOperator.LESS_THAN_OR_EQUAL;
    type PREFIX_MATCH = typeof IgdbFilters_FilterOperator.PREFIX_MATCH;
    type SUFFIX_MATCH = typeof IgdbFilters_FilterOperator.SUFFIX_MATCH;
    type INFIX_MATCH = typeof IgdbFilters_FilterOperator.INFIX_MATCH;
    type ANY = typeof IgdbFilters_FilterOperator.ANY;
    type ALL = typeof IgdbFilters_FilterOperator.ALL;
    type NONE = typeof IgdbFilters_FilterOperator.NONE;
    type NOT_ALL = typeof IgdbFilters_FilterOperator.NOT_ALL;
    type EXACT = typeof IgdbFilters_FilterOperator.EXACT;
    type UNRECOGNIZED = typeof IgdbFilters_FilterOperator.UNRECOGNIZED;
}
export declare function igdbFilters_FilterOperatorFromJSON(object: any): IgdbFilters_FilterOperator;
export declare function igdbFilters_FilterOperatorToJSON(object: IgdbFilters_FilterOperator): string;
export interface IgdbFilters_FilterValue {
    value: string;
    operator?: IgdbFilters_FilterOperator | undefined;
}
export interface IgdbFilters_FiltersEntry {
    key: string;
    value?: IgdbFilters_FilterValue | undefined;
}
export interface IgdbFields {
    selector?: {
        $case: "include";
        include: IgdbFields_IncludeFields;
    } | {
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
    title?: string | undefined;
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
export declare const IgdbSearch: MessageFns<IgdbSearch>;
export declare const IgdbPagination: MessageFns<IgdbPagination>;
export declare const IgdbFilters: MessageFns<IgdbFilters>;
export declare const IgdbFilters_FilterValue: MessageFns<IgdbFilters_FilterValue>;
export declare const IgdbFilters_FiltersEntry: MessageFns<IgdbFilters_FiltersEntry>;
export declare const IgdbFields: MessageFns<IgdbFields>;
export declare const IgdbFields_IncludeFields: MessageFns<IgdbFields_IncludeFields>;
export declare const IgdbFields_ExcludeFields: MessageFns<IgdbFields_ExcludeFields>;
export declare const IgdbGameSearchQuery: MessageFns<IgdbGameSearchQuery>;
export declare const IgdbGameSearchQuery_Fields: MessageFns<IgdbGameSearchQuery_Fields>;
export declare const IgdbPlatformSearchQuery: MessageFns<IgdbPlatformSearchQuery>;
export declare const IgdbPlatformSearchQuery_Fields: MessageFns<IgdbPlatformSearchQuery_Fields>;
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {
    $case: string;
} ? {
    [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]>;
} & {
    $case: T["$case"];
} : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
