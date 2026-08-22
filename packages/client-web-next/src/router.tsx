import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { BASE_URL } from "./env";
import type { QueryClient } from "@tanstack/react-query";
import type { RetromClient } from "./api-client/client";
import type { RetromClientConfigJson } from "@retrom/codegen/retrom/client/v1/client_config_pb";

export interface RouterContext {
  queryClient: QueryClient;
  config: RetromClientConfigJson;
  retromClient: RetromClient;
}

export function getRouter(context: RouterContext) {
  const router = createTanStackRouter({
    routeTree,
    context,
    basepath: BASE_URL,
    scrollRestoration: true,
    defaultViewTransition: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
