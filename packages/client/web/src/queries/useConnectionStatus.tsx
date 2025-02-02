import { useToast } from "@/components/ui/use-toast";
import { versionToString } from "@/lib/version-utils";
import { useRetromClient } from "@/providers/retrom-client";
import { QueryStatus, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type ConnectionStatus = "CONNECTED" | "NOT_CONNECTED" | "CONNECTING";

const StatusMap: Record<QueryStatus, ConnectionStatus> = {
  pending: "CONNECTING",
  success: "CONNECTED",
  error: "NOT_CONNECTED",
};

export function useConnectionStatus() {
  const { serverClient, host } = useRetromClient();
  const { toast } = useToast();

  const { status, data } = useQuery({
    queryFn: () => serverClient.getServerInfo({}),
    queryKey: ["connectionStatus"],
    retry: (count, err) => {
      if (count > 3) {
        console.error(err);
        toast({
          title: "Failed to connect",
          description: "Could not connect to the Retrom server.",
          variant: "destructive",
          duration: Infinity,
        });

        return false;
      }

      return true;
    },
  });

  const connectionStatus = useMemo(() => StatusMap[status], [status]);

  const connectionInfo = useMemo(() => {
    if (status !== "success") {
      return undefined;
    }

    const version = data.serverInfo?.version
      ? versionToString(data.serverInfo.version)
      : undefined;

    return {
      host,
      version,
    };
  }, [status, data, host]);

  return {
    connectionStatus,
    connectionInfo,
  };
}
