import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "retrom";
export declare const StorageType: {
    /**
     * SINGLE_FILE_GAME - Standard library directory with single-file games
     * e.g. /contentDir/platformX/game.rom
     */
    readonly SINGLE_FILE_GAME: 0;
    /**
     * MULTI_FILE_GAME - Standard library directory with multi-file games
     * e.g. /contentDir/platformX/game/game.rom
     */
    readonly MULTI_FILE_GAME: 1;
    /**
     * CUSTOM - Custom, user-defined structure composed of named macros
     * used for non-standard library directories and/or automatic
     * tagging of scanned entries
     *
     * example user definition: "/some/path/{platform}/{game}/{region}/{file}"
     */
    readonly CUSTOM: 2;
    readonly UNRECOGNIZED: -1;
};
export type StorageType = typeof StorageType[keyof typeof StorageType];
export declare namespace StorageType {
    type SINGLE_FILE_GAME = typeof StorageType.SINGLE_FILE_GAME;
    type MULTI_FILE_GAME = typeof StorageType.MULTI_FILE_GAME;
    type CUSTOM = typeof StorageType.CUSTOM;
    type UNRECOGNIZED = typeof StorageType.UNRECOGNIZED;
}
export declare function storageTypeFromJSON(object: any): StorageType;
export declare function storageTypeToJSON(object: StorageType): string;
export interface ConnectionConfig {
    port?: number | undefined;
    dbUrl?: string | undefined;
}
export interface IgnorePatterns {
    patterns: string[];
}
export interface CustomLibraryDefinition {
    definition: string;
}
export interface ContentDirectory {
    path: string;
    storageType?: StorageType | undefined;
    ignorePatterns?: IgnorePatterns | undefined;
    customLibraryDefinition?: CustomLibraryDefinition | undefined;
}
export interface IGDBConfig {
    clientId: string;
    clientSecret: string;
}
export interface SteamConfig {
    apiKey: string;
    userId: string;
}
export interface ServerConfig {
    connection?: ConnectionConfig | undefined;
    contentDirectories: ContentDirectory[];
    igdb?: IGDBConfig | undefined;
    steam?: SteamConfig | undefined;
}
export declare const ConnectionConfig: MessageFns<ConnectionConfig>;
export declare const IgnorePatterns: MessageFns<IgnorePatterns>;
export declare const CustomLibraryDefinition: MessageFns<CustomLibraryDefinition>;
export declare const ContentDirectory: MessageFns<ContentDirectory>;
export declare const IGDBConfig: MessageFns<IGDBConfig>;
export declare const SteamConfig: MessageFns<SteamConfig>;
export declare const ServerConfig: MessageFns<ServerConfig>;
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
