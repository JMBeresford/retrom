import {
  QueryCache,
  QueryClient,
  QueryClientProvider as QueryClientProviderImpl,
} from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { Status, ClientError } from "nice-grpc-common";
import { useToast } from "@/components/ui/use-toast";

export function QueryClientProvider(props: PropsWithChildren) {
  const { toast } = useToast();

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
                case Status.INTERNAL:
                default: {
                  toast({
                    variant: "destructive",
                    title: "Internal server error",
                    description,
                  });
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
