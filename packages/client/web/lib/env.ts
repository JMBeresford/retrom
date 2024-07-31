const { RETROM_PORT, RETROM_HOST, RETROM_HOSTNAME } = process.env;

export const API_HOSTNAME =
  RETROM_HOSTNAME ??
  process.env.NEXT_PUBLIC_RETROM_HOSTNAME ??
  "http://localhost";

export const API_PORT =
  RETROM_PORT ?? process.env.NEXT_PUBLIC_RETROM_PORT ?? "5101";

const API_HOST =
  RETROM_HOST ??
  process.env.NEXT_PUBLIC_RETROM_HOST ??
  `${API_HOSTNAME}:${API_PORT}`;

export const GRPC_HOST =
  process.env.GRPC_HOST ?? process.env.NEXT_PUBLIC_GRPC_HOST ?? API_HOST;

export const REST_HOST =
  process.env.REST_HOST ??
  process.env.NEXT_PUBLIC_REST_HOST ??
  `${API_HOST}/rest`;

export const IS_DESKTOP = process.env.NEXT_PUBLIC_PLATFORM === "desktop";

console.log({
  API_HOSTNAME,
  API_PORT,
  API_HOST,
  GRPC_HOST,
  REST_HOST,
  IS_DESKTOP,
});
