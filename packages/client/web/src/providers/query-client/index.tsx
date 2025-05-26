import {
  QueryCache,
  QueryClient,
  QueryClientProvider as QueryClientProviderImpl,
} from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ConnectError, Code } from "@connectrpc/connect";

export function QueryClientProvider(props: PropsWithChildren) {
  const { toast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            throwOnError: false,
            queryKeyHashFn: (key) =>
              JSON.stringify(key, (_: unknown, v: unknown) =>
                typeof v === "bigint" ? v.toString() : v,
              ),
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            console.error(error);
            if (error instanceof ConnectError) {
              const description = (
                <span className="text-wrap break-all">{error.message}</span>
              );

              switch (error.code) {
                case Code.Unauthenticated: {
                  toast({
                    variant: "destructive",
                    title: "Unauthenticated",
                    description,
                  });

                  break;
                }

                case Code.Internal: {
                  toast({
                    variant: "destructive",
                    title: "Internal server error",
                    description,
                  });

                  break;
                }

                default: {
                  break;
                }
              }
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProviderImpl client={queryClient}>
      {props.children}
    </QueryClientProviderImpl>
  );
}
