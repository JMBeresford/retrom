export const IS_DESKTOP =
  typeof window !== "undefined"
    ? "__TAURI__" in window || "__TAURI_INTERNALS__" in window
    : undefined;

console.log({ IS_DESKTOP });
