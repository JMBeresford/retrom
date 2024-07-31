const { RETROM_PORT, RETROM_HOST, RETROM_HOSTNAME } = process.env;

export function API_HOSTNAME() {
  return (
    RETROM_HOSTNAME ??
    process.env.NEXT_PUBLIC_RETROM_HOSTNAME ??
    "http://localhost"
  );
}

export function API_PORT() {
  return RETROM_PORT ?? process.env.NEXT_PUBLIC_RETROM_PORT ?? "5101";
}

function API_HOST() {
  return (
    RETROM_HOST ??
    process.env.NEXT_PUBLIC_RETROM_HOST ??
    `${API_HOSTNAME()}:${API_PORT()}`
  );
}

export function GRPC_HOST() {
  return (
    process.env.GRPC_HOST ?? process.env.NEXT_PUBLIC_GRPC_HOST ?? API_HOST()
  );
}

export function REST_HOST() {
  return (
    process.env.REST_HOST ??
    process.env.NEXT_PUBLIC_REST_HOST ??
    `${API_HOST()}/rest`
  );
}

export const IS_DESKTOP = process.env.NEXT_PUBLIC_PLATFORM === "desktop";
