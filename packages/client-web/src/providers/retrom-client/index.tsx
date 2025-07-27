import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { RetromClient } from "./client";
import { useApiUrl } from "@/utils/useApiUrl";

const context = createContext<RetromClient | undefined>(undefined);

export function RetromClientProvider(props: PropsWithChildren) {
  const { children } = props;

  const apiUrl = useApiUrl();

  const client = useMemo(() => {
    return new RetromClient(apiUrl?.toString() || "/");
  }, [apiUrl]);

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
