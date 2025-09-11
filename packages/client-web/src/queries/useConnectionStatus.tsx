import { useToast } from "@retrom/ui/hooks/use-toast";
import { versionToString } from "@/lib/version-utils";
import { configStore } from "@/providers/config";
import { useRetromClient } from "@/providers/retrom-client";
import { QueryStatus, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
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
      if (configStore.getState().server === undefined) {
        toast({
          id: "no-server-configured",
          title: "No server configured",
          description:
            "In order to use Retrom, you need to either connect to a server or enable standalone mode.",
          action: (
            <Link
              to="."
              search={(prev) => ({
                ...prev,
                configModal: {
                  open: true,
                  tab: "client",
                  clientTab: "connection",
                },
              })}
            >
              Connect
            </Link>
          ),
        });

        return false;
      }

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
