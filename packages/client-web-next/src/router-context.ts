import { QueryClient } from "@tanstack/react-query";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export function getContext() {
  const queryClient = new QueryClient();

  return {
    queryClient,
  };
}
