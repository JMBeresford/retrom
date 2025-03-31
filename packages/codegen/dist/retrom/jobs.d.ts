import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export declare const protobufPackage = "retrom";
export declare const JobStatus: {
    readonly Running: 0;
    readonly Success: 1;
    readonly Failure: 2;
    readonly Idle: 3;
    readonly UNRECOGNIZED: -1;
};
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];
export declare namespace JobStatus {
    type Running = typeof JobStatus.Running;
    type Success = typeof JobStatus.Success;
    type Failure = typeof JobStatus.Failure;
    type Idle = typeof JobStatus.Idle;
    type UNRECOGNIZED = typeof JobStatus.UNRECOGNIZED;
}
export declare function jobStatusFromJSON(object: any): JobStatus;
export declare function jobStatusToJSON(object: JobStatus): string;
export interface JobProgress {
    percent: number;
    status: JobStatus;
    name: string;
}
export declare const JobProgress: MessageFns<JobProgress>;
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
