import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "retrom";
export declare const FilesystemNodeType: {
    readonly DIRECTORY: 0;
    readonly FILE: 1;
    readonly UNRECOGNIZED: -1;
};
export type FilesystemNodeType = typeof FilesystemNodeType[keyof typeof FilesystemNodeType];
export declare namespace FilesystemNodeType {
    type DIRECTORY = typeof FilesystemNodeType.DIRECTORY;
    type FILE = typeof FilesystemNodeType.FILE;
    type UNRECOGNIZED = typeof FilesystemNodeType.UNRECOGNIZED;
}
export declare function filesystemNodeTypeFromJSON(object: any): FilesystemNodeType;
export declare function filesystemNodeTypeToJSON(object: FilesystemNodeType): string;
export interface FilesystemNode {
    path: string;
    name: string;
    nodeType: FilesystemNodeType;
}
export declare const FilesystemNode: MessageFns<FilesystemNode>;
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
