import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { RetromClient } from "./client";
import { useConfig } from "../config";
import { checkIsDesktop } from "@/lib/env";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren) {
  const configStore = useConfig();
  const hostname = configStore((store) => store.server.hostname);
  const port = configStore((store) => store.server.port);
  const { children } = props;

  const client = useMemo(() => {
    const host = checkIsDesktop()
      ? hostname + (port ? `:${port}` : "")
      : "/api";

    return new RetromClient(host);
  }, [hostname, port]);

  return <context.Provider value={client}>{children}</context.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- we need to export this hook
export function useRetromClient() {
  const client = useContext(context);

  if (!client) {
    throw new Error(
      "useRetromClient must be used within a RetromClientProvider",
    );
  }

  return client;
}
