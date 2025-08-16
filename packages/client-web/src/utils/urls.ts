import { checkIsDesktop } from "@/lib/env";
import { useConfig } from "@/providers/config";
import { useMemo } from "react";

export function useApiUrl() {
  const { hostname, port } = useConfig((s) => s.server) ?? {};

  return useMemo(() => {
    if (!checkIsDesktop()) {
      const host = import.meta.env.VITE_RETROM_LOCAL_SERVICE_HOST;
      const url = host ? new URL(host) : new URL("/", window.location.href);
      return url;
    }

    if (!hostname) {
      return;
    }

    const url = new URL(hostname);
    if (port !== undefined) {
      url.port = port.toString();
    }

    return url;
  }, [hostname, port]);
}

export function joinUrlParts(...parts: string[]): string {
  return parts
    .map((part) => part.replace(/(^\/+|\/+$)/g, "")) // Remove leading and trailing slashes
    .filter((p) => p !== "") // Remove empty parts
    .join("/");
}

export function createUrl(opts: {
  path: string | string[];
  base: string | URL;
}) {
  try {
    const base = opts.base instanceof URL ? opts.base : new URL(opts.base);
    const pathParts = Array.isArray(opts.path) ? opts.path : [opts.path];

    if (base.pathname) {
      pathParts.unshift(base.pathname);
    }

    const path = joinUrlParts(...pathParts);

    return new URL(path, base.origin);
  } catch (error) {
    console.error("Error creating URL:", error);
    return undefined;
  }
}

export function usePublicUrl() {
  const apiUrl = useApiUrl();

  if (apiUrl) {
    return new URL(joinUrlParts("rest", "public"), apiUrl);
  }
}
