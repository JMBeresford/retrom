import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConfig } from "./config/store";
import { useRetromClient } from "./api-client/context";
import { getRouter } from "./router";
import type { RouterContext } from "./router";

const queryClient = new QueryClient();

export function App() {
  const config = useConfig((c) => c);
  const retromClient = useRetromClient();

  const context: RouterContext = {
    config,
    retromClient,
    queryClient,
  };

  const router = getRouter(context);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={context} />
    </QueryClientProvider>
  );
}
