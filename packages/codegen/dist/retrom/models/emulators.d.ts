import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "../../google/protobuf/timestamp";
export declare const protobufPackage = "retrom";
export declare const SaveStrategy: {
    readonly SINGLE_FILE: 0;
    readonly FILE_SYSTEM_DIRECTORY: 1;
    readonly DISK_IMAGE: 2;
    readonly UNRECOGNIZED: -1;
};
export type SaveStrategy = typeof SaveStrategy[keyof typeof SaveStrategy];
export declare namespace SaveStrategy {
    type SINGLE_FILE = typeof SaveStrategy.SINGLE_FILE;
    type FILE_SYSTEM_DIRECTORY = typeof SaveStrategy.FILE_SYSTEM_DIRECTORY;
    type DISK_IMAGE = typeof SaveStrategy.DISK_IMAGE;
    type UNRECOGNIZED = typeof SaveStrategy.UNRECOGNIZED;
}
export declare function saveStrategyFromJSON(object: any): SaveStrategy;
export declare function saveStrategyToJSON(object: SaveStrategy): string;
export interface Emulator {
    id: number;
    supportedPlatforms: number[];
    name: string;
    saveStrategy: SaveStrategy;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface NewEmulator {
    supportedPlatforms: number[];
    name: string;
    saveStrategy: SaveStrategy;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface UpdatedEmulator {
    id: number;
    supportedPlatforms: number[];
    name?: string | undefined;
    saveStrategy?: SaveStrategy | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}
export interface EmulatorProfile {
    id: number;
    emulatorId: number;
    name: string;
    supportedExtensions: string[];
    customArgs: string[];
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    builtIn: boolean;
}
export interface NewEmulatorProfile {
    emulatorId: number;
    name: string;
    supportedExtensions: string[];
    customArgs: string[];
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    builtIn?: boolean | undefined;
}
export interface UpdatedEmulatorProfile {
    id: number;
    emulatorId?: number | undefined;
    name?: string | undefined;
    supportedExtensions: string[];
    customArgs: string[];
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    builtIn?: boolean | undefined;
}
export interface DefaultEmulatorProfile {
    platformId: number;
    emulatorProfileId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    clientId: number;
}
export interface NewDefaultEmulatorProfile {
    platformId: number;
    emulatorProfileId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    clientId?: number | undefined;
}
export interface UpdatedDefaultEmulatorProfile {
    platformId: number;
    emulatorProfileId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    clientId?: number | undefined;
}
export interface LocalEmulatorConfig {
    id: number;
    emulatorId: number;
    clientId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    executablePath: string;
    nickname?: string | undefined;
}
export interface NewLocalEmulatorConfig {
    emulatorId: number;
    clientId: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    executablePath: string;
    nickname?: string | undefined;
}
export interface UpdatedLocalEmulatorConfig {
    id: number;
    emulatorId?: number | undefined;
    clientId?: number | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    executablePath?: string | undefined;
    nickname?: string | undefined;
}
export declare const Emulator: MessageFns<Emulator>;
export declare const NewEmulator: MessageFns<NewEmulator>;
export declare const UpdatedEmulator: MessageFns<UpdatedEmulator>;
export declare const EmulatorProfile: MessageFns<EmulatorProfile>;
export declare const NewEmulatorProfile: MessageFns<NewEmulatorProfile>;
export declare const UpdatedEmulatorProfile: MessageFns<UpdatedEmulatorProfile>;
export declare const DefaultEmulatorProfile: MessageFns<DefaultEmulatorProfile>;
export declare const NewDefaultEmulatorProfile: MessageFns<NewDefaultEmulatorProfile>;
export declare const UpdatedDefaultEmulatorProfile: MessageFns<UpdatedDefaultEmulatorProfile>;
export declare const LocalEmulatorConfig: MessageFns<LocalEmulatorConfig>;
export declare const NewLocalEmulatorConfig: MessageFns<NewLocalEmulatorConfig>;
export declare const UpdatedLocalEmulatorConfig: MessageFns<UpdatedLocalEmulatorConfig>;
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
