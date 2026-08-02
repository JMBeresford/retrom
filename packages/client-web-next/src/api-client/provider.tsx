import { useMemo } from "react";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { useApiUrl } from "./use-api-url";
import { RetromClient } from "./client";
import { context } from "./context";
import { otelInterceptor } from "./otel";
import type { PropsWithChildren } from "react";

export function RetromClientProvider(props: PropsWithChildren) {
  const { children } = props;

  const apiUrl = useApiUrl();

  const transport = useMemo(() => {
    let host = apiUrl?.toString() || "/";
    if (host.endsWith("/")) {
      host = host.slice(0, -1);
    }

    return createGrpcWebTransport({
      baseUrl: host,
      interceptors: [otelInterceptor],
    });
  }, [apiUrl]);

  const client = useMemo(() => {
    return new RetromClient(transport);
  }, [transport]);

  return <context.Provider value={client}>{children}</context.Provider>;
}
