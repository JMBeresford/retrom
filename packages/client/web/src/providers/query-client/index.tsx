import {
  QueryCache,
  QueryClient,
  QueryClientProvider as QueryClientProviderImpl,
} from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { Status, ClientError } from "nice-grpc-common";
import { toast } from "@/components/ui/use-toast";

export function QueryClientProvider(props: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60, throwOnError: false },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            console.error(error);
            if (error instanceof ClientError) {
              const description = (
                <span className="text-wrap break-all">{error.message}</span>
              );

              switch (error.code) {
                case Status.UNAUTHENTICATED: {
                  toast({
                    variant: "destructive",
                    title: "Unauthenticated",
                    description,
                  });

                  break;
                }

                case Status.INTERNAL: {
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
