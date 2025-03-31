import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../google/protobuf/timestamp";
export declare const protobufPackage = "retrom";
export interface Platform {
    id: number;
    path: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted: boolean;
    thirdParty: boolean;
}
export interface NewPlatform {
    path: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted: boolean;
    thirdParty: boolean;
}
export interface UpdatedPlatform {
    id: number;
    path?: string | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    deletedAt?: Timestamp | undefined;
    isDeleted?: boolean | undefined;
    thirdParty?: boolean | undefined;
}
export declare const Platform: MessageFns<Platform>;
export declare const NewPlatform: MessageFns<NewPlatform>;
export declare const UpdatedPlatform: MessageFns<UpdatedPlatform>;
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
