export declare class EJS_STORAGE {
  constructor(dbName: unknown, storeName: unknown);
  addFileToDB(key: unknown, add: unknown): void;
  get(key: unknown): unknown;
  put(key: unknown, data: unknown): unknown;
  remove(key: unknown): unknown;
  getSizes(): unknown;
}
export declare class EJS_DUMMYSTORAGE {
  constructor();
  addFileToDB(): unknown;
  get(): unknown;
  put(): unknown;
  remove(): unknown;
  getSizes(): unknown;
}

declare global {
  export interface Window {
    EJS_STORAGE?: typeof EJS_STORAGE;
    EJS_DUMMYSTORAGE?: typeof EJS_DUMMYSTORAGE;
  }
}
