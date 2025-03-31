import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../google/protobuf/timestamp";
export declare const protobufPackage = "retrom";
export interface GameFile {
    id: number;
    byteSize: number;
    path: string;
    gameId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted: boolean;
}
export interface NewGameFile {
    byteSize: number;
    path: string;
    gameId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted: boolean;
}
export interface UpdatedGameFile {
    id: number;
    byteSize?: number | undefined;
    path?: string | undefined;
    gameId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted?: boolean | undefined;
}
export declare const GameFile: MessageFns<GameFile>;
export declare const NewGameFile: MessageFns<NewGameFile>;
export declare const UpdatedGameFile: MessageFns<UpdatedGameFile>;
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
