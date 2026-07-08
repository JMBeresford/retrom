/**
 * App is running in a desktop environment (Tauri) or not.
 */
export const IS_DESKTOP = !!import.meta.env.VITE_IS_DESKTOP;

export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const RETROM_PORT = import.meta.env.VITE_RETROM_PORT || "5101";
export const RETROM_HOSTNAME =
  import.meta.env.VITE_RETROM_HOST || "http://localhost";
