export const API_HOSTNAME = process.env.RETROM_HOSTNAME ?? "http://localhost";
export const API_PORT = process.env.RETROM_PORT ?? "5101";

const API_HOST = process.env.RETROM_HOST ?? `${API_HOSTNAME}:${API_PORT}`;

export const GRPC_HOST = process.env.GRPC_HOST ?? API_HOST;
export const REST_HOST = process.env.REST_HOST ?? `${API_HOST}/rest`;

export const IS_DESKTOP = process.env.NEXT_PUBLIC_PLATFORM === "desktop";
