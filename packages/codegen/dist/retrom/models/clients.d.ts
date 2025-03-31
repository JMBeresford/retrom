import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../google/protobuf/timestamp";
export declare const protobufPackage = "retrom";
export interface Client {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface NewClient {
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface UpdatedClient {
    id: number;
    name?: string | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export declare const Client: MessageFns<Client>;
export declare const NewClient: MessageFns<NewClient>;
export declare const UpdatedClient: MessageFns<UpdatedClient>;
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
