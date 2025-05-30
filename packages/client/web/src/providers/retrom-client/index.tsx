import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { RetromClient } from "./client";
import { useConfig } from "../config";
import { checkIsDesktop } from "@/lib/env";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren) {
  const { children } = props;

  const { hostname, port } = useConfig((s) => s.server) ?? {
    hostname: "http://localhost",
  };

  const client = useMemo(() => {
    const host = checkIsDesktop()
      ? hostname + (port ? `:${port}` : "")
      : "/api";

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
