export type KeyedIDBEntry<T = unknown> = { path: IDBValidKey; data: T };

export async function openIDB(dbName: string, storeName: string) {
  return new Promise<IDBView>((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = () => {
      reject(request.error!);
    };

    request.onsuccess = () => {
      resolve(new IDBView(request.result, storeName));
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
}

class IDBView {
  readonly db: IDBDatabase;
  readonly transaction: IDBTransaction;
  readonly store: IDBObjectStore;

  constructor(db: IDBDatabase, storeName: string) {
    this.db = db;

    this.transaction = db.transaction([storeName], "readwrite");
    this.store = this.transaction.objectStore(storeName);
  }

  async getAt<T>(key: IDBValidKey) {
    return new Promise<KeyedIDBEntry<T>>((resolve, reject) => {
      const request = this.store.get(key);
      request.onerror = () => {
        reject(request.error!);
      };

      request.onsuccess = () => {
        resolve({ path: key, data: request.result as T });
      };
    });
  }

  async getAllAt<T>(key?: IDBValidKey | IDBKeyRange) {
    return new Promise<KeyedIDBEntry<T>[]>((resolve, reject) => {
      const keysReq = this.store.getAllKeys(key);

      keysReq.onerror = () => {
        reject(keysReq.error!);
      };

      keysReq.onsuccess = () => {
        const keys = keysReq.result;
        const promises = keys.map((k) => this.getAt<T>(k));

        Promise.all(promises)
          .then((res) => resolve(res))
          .catch(reject);
      };
    });
  }
}
