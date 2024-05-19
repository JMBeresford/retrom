export const API_HOSTNAME = process.env.API_HOSTNAME ?? "http://localhost";
export const API_PORT = process.env.API_PORT ?? "5001";
const API_HOST = process.env.API_HOST ?? `${API_HOSTNAME}:${API_PORT}`;

export const GRPC_HOST = process.env.GRPC_HOST ?? API_HOST;
export const REST_HOST = process.env.REST_HOST ?? `${API_HOST}/rest`;
