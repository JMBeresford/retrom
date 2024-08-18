"use client";

import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { RetromClient } from "./client";
import { useConfig } from "../config";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren<{}>) {
  const configStore = useConfig();
  const hostname = configStore((store) => store.server.hostname);
  const port = configStore((store) => store.server.port);
  const { children } = props;

  const client = useMemo(() => {
    const host = hostname + (port ? `:${port}` : "");

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
