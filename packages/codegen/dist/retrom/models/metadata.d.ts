import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../google/protobuf/timestamp";
export declare const protobufPackage = "retrom";
export interface GameMetadata {
    gameId: number;
    name?: string | undefined;
    description?: string | undefined;
    coverUrl?: string | undefined;
    backgroundUrl?: string | undefined;
    iconUrl?: string | undefined;
    igdbId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    links: string[];
    videoUrls: string[];
    screenshotUrls: string[];
    artworkUrls: string[];
    releaseDate?: Timestamp | undefined;
    lastPlayed?: Timestamp | undefined;
    minutesPlayed?: number | undefined;
}
export interface NewGameMetadata {
    gameId?: number | undefined;
    name?: string | undefined;
    description?: string | undefined;
    coverUrl?: string | undefined;
    backgroundUrl?: string | undefined;
    iconUrl?: string | undefined;
    igdbId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    links: string[];
    videoUrls: string[];
    screenshotUrls: string[];
    artworkUrls: string[];
    releaseDate?: Timestamp | undefined;
    lastPlayed?: Timestamp | undefined;
    minutesPlayed?: number | undefined;
}
export interface UpdatedGameMetadata {
    gameId: number;
    name?: string | undefined;
    description?: string | undefined;
    coverUrl?: string | undefined;
    backgroundUrl?: string | undefined;
    iconUrl?: string | undefined;
    igdbId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    links: string[];
    videoUrls: string[];
    screenshotUrls: string[];
    artworkUrls: string[];
    releaseDate?: Timestamp | undefined;
    lastPlayed?: Timestamp | undefined;
    minutesPlayed?: number | undefined;
}
export interface PlatformMetadata {
    platformId: number;
    name?: string | undefined;
    description?: string | undefined;
    backgroundUrl?: string | undefined;
    logoUrl?: string | undefined;
    igdbId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface NewPlatformMetadata {
    platformId?: number | undefined;
    name?: string | undefined;
    description?: string | undefined;
    backgroundUrl?: string | undefined;
    logoUrl?: string | undefined;
    igdbId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface UpdatedPlatformMetadata {
    platformId: number;
    name?: string | undefined;
    description?: string | undefined;
    backgroundUrl?: string | undefined;
    logoUrl?: string | undefined;
    igdbId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface GameGenre {
    id: number;
    slug: string;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface NewGameGenre {
    id?: number | undefined;
    slug: string;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface UpdatedGameGenre {
    id: number;
    slug?: string | undefined;
    name?: string | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface GameGenreMap {
    gameId: number;
    genreId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface NewGameGenreMap {
    gameId: number;
    genreId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface UpdatedGameGenreMap {
    gameId?: number | undefined;
    genreId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface SimilarGameMap {
    gameId: number;
    similarGameId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface NewSimilarGameMap {
    gameId: number;
    similarGameId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface UpdatedSimilarGameMap {
    gameId: number;
    similarGameId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export declare const GameMetadata: MessageFns<GameMetadata>;
export declare const NewGameMetadata: MessageFns<NewGameMetadata>;
export declare const UpdatedGameMetadata: MessageFns<UpdatedGameMetadata>;
export declare const PlatformMetadata: MessageFns<PlatformMetadata>;
export declare const NewPlatformMetadata: MessageFns<NewPlatformMetadata>;
export declare const UpdatedPlatformMetadata: MessageFns<UpdatedPlatformMetadata>;
export declare const GameGenre: MessageFns<GameGenre>;
export declare const NewGameGenre: MessageFns<NewGameGenre>;
export declare const UpdatedGameGenre: MessageFns<UpdatedGameGenre>;
export declare const GameGenreMap: MessageFns<GameGenreMap>;
export declare const NewGameGenreMap: MessageFns<NewGameGenreMap>;
export declare const UpdatedGameGenreMap: MessageFns<UpdatedGameGenreMap>;
export declare const SimilarGameMap: MessageFns<SimilarGameMap>;
export declare const NewSimilarGameMap: MessageFns<NewSimilarGameMap>;
export declare const UpdatedSimilarGameMap: MessageFns<UpdatedSimilarGameMap>;
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
