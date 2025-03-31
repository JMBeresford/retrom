import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Emulator, EmulatorProfile } from "../models/emulators";
import { GameFile } from "../models/game-files";
import { Game } from "../models/games";
export declare const protobufPackage = "retrom";
export declare const InstallationStatus: {
    readonly INSTALLED: 0;
    readonly INSTALLING: 1;
    readonly NOT_INSTALLED: 2;
    readonly UNRECOGNIZED: -1;
};
export type InstallationStatus = typeof InstallationStatus[keyof typeof InstallationStatus];
export declare namespace InstallationStatus {
    type INSTALLED = typeof InstallationStatus.INSTALLED;
    type INSTALLING = typeof InstallationStatus.INSTALLING;
    type NOT_INSTALLED = typeof InstallationStatus.NOT_INSTALLED;
    type UNRECOGNIZED = typeof InstallationStatus.UNRECOGNIZED;
}
export declare function installationStatusFromJSON(object: any): InstallationStatus;
export declare function installationStatusToJSON(object: InstallationStatus): string;
export declare const PlayStatus: {
    readonly PLAYING: 0;
    readonly NOT_PLAYING: 1;
    readonly UNRECOGNIZED: -1;
};
export type PlayStatus = typeof PlayStatus[keyof typeof PlayStatus];
export declare namespace PlayStatus {
    type PLAYING = typeof PlayStatus.PLAYING;
    type NOT_PLAYING = typeof PlayStatus.NOT_PLAYING;
    type UNRECOGNIZED = typeof PlayStatus.UNRECOGNIZED;
}
export declare function playStatusFromJSON(object: any): PlayStatus;
export declare function playStatusToJSON(object: PlayStatus): string;
export interface RetromHostInfo {
    hostName: string;
    port: string;
    host: string;
}
export interface InstallationProgressUpdate {
    gameId: number;
    progress: number;
}
export interface InstallGamePayload {
    game?: Game | undefined;
    files: GameFile[];
}
export interface UninstallGamePayload {
    game?: Game | undefined;
}
export interface PlayGamePayload {
    game?: Game | undefined;
    emulatorProfile?: EmulatorProfile | undefined;
    emulator?: Emulator | undefined;
    file?: GameFile | undefined;
}
export interface StopGamePayload {
    game?: Game | undefined;
}
export interface GetGamePlayStatusPayload {
    game?: Game | undefined;
}
export interface GamePlayStatusUpdate {
    gameId: number;
    playStatus: PlayStatus;
}
export interface InstallationState {
    installationState: Map<number, InstallationStatus>;
}
export interface InstallationState_InstallationStateEntry {
    key: number;
    value: InstallationStatus;
}
export declare const RetromHostInfo: MessageFns<RetromHostInfo>;
export declare const InstallationProgressUpdate: MessageFns<InstallationProgressUpdate>;
export declare const InstallGamePayload: MessageFns<InstallGamePayload>;
export declare const UninstallGamePayload: MessageFns<UninstallGamePayload>;
export declare const PlayGamePayload: MessageFns<PlayGamePayload>;
export declare const StopGamePayload: MessageFns<StopGamePayload>;
export declare const GetGamePlayStatusPayload: MessageFns<GetGamePlayStatusPayload>;
export declare const GamePlayStatusUpdate: MessageFns<GamePlayStatusUpdate>;
export declare const InstallationState: MessageFns<InstallationState>;
export declare const InstallationState_InstallationStateEntry: MessageFns<InstallationState_InstallationStateEntry>;
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
