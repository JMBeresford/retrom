import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { RetromClient } from "./client";
import { useConfig } from "../config";
import { checkIsDesktop } from "@/lib/env";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren) {
  const { hostname, port } = useConfig((s) => s.server) ?? {
    hostname: "http://localhost",
  };

  const { children } = props;

  const client = useMemo(() => {
    const url = new URL(hostname);
    if (port !== undefined) {
      url.port = port.toString();
    }

    const host = checkIsDesktop() ? url.toString() : "./api";

    return new RetromClient(host);
  }, [hostname, port]);

  return <context.Provider value={client}>{children}</context.Provider>;
}

export function useRetromClient() {
  const client = useContext(context);

  if (!client) {
    throw new Error(
      "useRetromClient must be used within a RetromClientProvider",
    );
  }

  return client;
}
