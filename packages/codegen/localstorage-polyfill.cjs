// Minimal localStorage polyfill for Node environments where `localStorage`
// exists but does not implement the standard Storage interface (e.g. Node 25).
// This is only used during code generation (buf/protoc-gen-es) and keeps
// everything in-memory for the lifetime of the process.

(() => {
  try {
    const ls = globalThis.localStorage;
    if (ls && typeof ls.getItem === 'function') {
      // A compatible implementation already exists; do nothing.
      return;
    }
  } catch {
    // Accessing localStorage might throw in some environments; fall through to polyfill.
  }

  const store = new Map();

  const localStoragePolyfill = {
    getItem(key) {
      const value = store.get(String(key));
      return value === undefined ? null : value;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    },
    key(index) {
      const keys = Array.from(store.keys());
      return index >= 0 && index < keys.length ? keys[index] : null;
    },
    get length() {
      return store.size;
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStoragePolyfill,
    configurable: true,
    enumerable: false,
    writable: true,
  });
})();


