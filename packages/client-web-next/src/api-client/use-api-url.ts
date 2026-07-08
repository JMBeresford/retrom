import { useMemo } from "react";
import { useConfig } from "@/config/store";
import { IS_DESKTOP } from "@/env";

export function useApiUrl() {
  const { hostname, port } = useConfig((s) => s.server) ?? {};

  return useMemo(() => {
    if (!IS_DESKTOP) {
      const url = new URL(window.location.origin);
      url.pathname = "/api/v1";

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
