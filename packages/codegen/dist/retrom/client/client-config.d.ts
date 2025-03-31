import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Client } from "../models/clients";
export declare const protobufPackage = "retrom";
export interface InterfaceConfig {
    fullscreenByDefault: boolean;
    fullscreenConfig?: InterfaceConfig_FullscreenConfig | undefined;
}
export declare const InterfaceConfig_GameListEntryImage: {
    readonly COVER: 0;
    readonly BACKGROUND: 1;
    readonly UNRECOGNIZED: -1;
};
export type InterfaceConfig_GameListEntryImage = typeof InterfaceConfig_GameListEntryImage[keyof typeof InterfaceConfig_GameListEntryImage];
export declare namespace InterfaceConfig_GameListEntryImage {
    type COVER = typeof InterfaceConfig_GameListEntryImage.COVER;
    type BACKGROUND = typeof InterfaceConfig_GameListEntryImage.BACKGROUND;
    type UNRECOGNIZED = typeof InterfaceConfig_GameListEntryImage.UNRECOGNIZED;
}
export declare function interfaceConfig_GameListEntryImageFromJSON(object: any): InterfaceConfig_GameListEntryImage;
export declare function interfaceConfig_GameListEntryImageToJSON(object: InterfaceConfig_GameListEntryImage): string;
export interface InterfaceConfig_GridListConfig {
    columns: number;
    gap: number;
    imageType: InterfaceConfig_GameListEntryImage;
}
export interface InterfaceConfig_FullscreenConfig {
    gridList?: InterfaceConfig_GridListConfig | undefined;
}
export interface RetromClientConfig {
    server?: RetromClientConfig_Server | undefined;
    config?: RetromClientConfig_Config | undefined;
    flowCompletions?: RetromClientConfig_FlowCompletions | undefined;
}
export interface RetromClientConfig_Server {
    hostname: string;
    port?: number | undefined;
    standalone?: boolean | undefined;
}
export interface RetromClientConfig_Config {
    clientInfo?: Client | undefined;
    interface?: InterfaceConfig | undefined;
    installationDir?: string | undefined;
}
export interface RetromClientConfig_FlowCompletions {
    setupComplete: boolean;
}
export declare const InterfaceConfig: MessageFns<InterfaceConfig>;
export declare const InterfaceConfig_GridListConfig: MessageFns<InterfaceConfig_GridListConfig>;
export declare const InterfaceConfig_FullscreenConfig: MessageFns<InterfaceConfig_FullscreenConfig>;
export declare const RetromClientConfig: MessageFns<RetromClientConfig>;
export declare const RetromClientConfig_Server: MessageFns<RetromClientConfig_Server>;
export declare const RetromClientConfig_Config: MessageFns<RetromClientConfig_Config>;
export declare const RetromClientConfig_FlowCompletions: MessageFns<RetromClientConfig_FlowCompletions>;
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
