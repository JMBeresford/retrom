import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../google/protobuf/timestamp";
import { StorageType } from "../server/config";
export declare const protobufPackage = "retrom";
export interface Game {
    id: number;
    path: string;
    platformId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted: boolean;
    defaultFileId?: number | undefined;
    storageType: StorageType;
    thirdParty: boolean;
    steamAppId?: number | undefined;
}
export interface NewGame {
    path: string;
    platformId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted: boolean;
    defaultFileId?: number | undefined;
    storageType?: StorageType | undefined;
    thirdParty?: boolean | undefined;
    steamAppId?: number | undefined;
}
export interface UpdatedGame {
    id: number;
    path?: string | undefined;
    platformId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted?: boolean | undefined;
    defaultFileId?: number | undefined;
    storageType?: StorageType | undefined;
    thirdParty?: boolean | undefined;
    steamAppId?: number | undefined;
}
export declare const Game: MessageFns<Game>;
export declare const NewGame: MessageFns<NewGame>;
export declare const UpdatedGame: MessageFns<UpdatedGame>;
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
