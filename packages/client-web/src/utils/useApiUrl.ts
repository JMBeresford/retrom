import { checkIsDesktop } from "@/lib/env";
import { useConfig } from "@/providers/config";
import { useMemo } from "react";

export function useApiUrl() {
  const { hostname, port } = useConfig((s) => s.server) ?? {};

  return useMemo(() => {
    if (!checkIsDesktop()) {
      const url = new URL("/api/", window.location.href);
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
