import { useMemo } from "react";
import { useApiUrl } from "./use-api-url";
import { RetromClient } from "./client";
import { context } from "./context";
import type { PropsWithChildren } from "react";

export function RetromClientProvider(props: PropsWithChildren) {
  const { children } = props;

  const apiUrl = useApiUrl();

  const client = useMemo(() => {
    return new RetromClient(apiUrl?.toString() || "/");
  }, [apiUrl]);

  return <context.Provider value={client}>{children}</context.Provider>;
}
