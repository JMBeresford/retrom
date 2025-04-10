export declare class EJS_COMPRESSION {
  constructor(EJS: unknown);
  isCompressed(data: unknown): "zip" | "7z" | "rar";
  decompress(data: unknown, updateMsg: unknown, fileCbFunc: unknown): unknown;
  getWorkerFile(method: unknown): unknown;
  decompressFile(
    method: unknown,
    data: unknown,
    updateMsg: unknown,
    fileCbFunc: unknown,
  ): unknown;
}

declare global {
  export interface Window {
    EJS_COMPRESSION: typeof EJS_COMPRESSION;
  }
}
