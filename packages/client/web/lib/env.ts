export const IS_DESKTOP =
  window !== undefined
    ? "__TAURI__" in window || "__TAURI_INTERNALS__" in window
    : undefined;
