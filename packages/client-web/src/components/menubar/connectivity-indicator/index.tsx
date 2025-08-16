import { Button } from "@retrom/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverProps,
} from "@retrom/ui/components/popover";
import { Separator } from "@retrom/ui/components/separator";
import { cn } from "@retrom/ui/lib/utils";
import { useConfig } from "@/providers/config";
import {
  ConnectionStatus,
  useConnectionStatus,
} from "@/queries/useConnectionStatus";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LucideProps, Server, ServerCog, ServerOff } from "lucide-react";
import { ReactNode } from "react";

const IconMap: Record<ConnectionStatus, (props: LucideProps) => ReactNode> = {
  CONNECTED: (props) => <Server {...props} />,
  NOT_CONNECTED: ({ className, ...props }) => (
    <ServerOff {...props} className={cn(className, "text-destructive-text")} />
  ),
  CONNECTING: ({ className, ...props }: LucideProps) => (
    <ServerCog {...props} className={cn(className, "animate-pulse")} />
  ),
};

export function ConnectivityIndicator(props: PopoverProps) {
  const { connectionStatus, connectionInfo } = useConnectionStatus();
  const server = useConfig((s) => s.server);
  const queryClient = useQueryClient();

  const Icon = IconMap[connectionStatus];

  return (
    <Popover {...props}>
      <PopoverTrigger asChild disabled={connectionStatus === "CONNECTING"}>
        <Button variant="ghost" size="icon" className="h-min w-min p-1">
          <Icon className="text-sm text-gray-500 h-[1.2rem] w-[1.2rem]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        hidden={connectionStatus === "CONNECTING"}
        className="w-fit"
      >
        <div>
          <h4 className="font-semibold mr-4">Connection Info</h4>

          <Separator className="my-2" />
          {connectionStatus === "CONNECTED" && connectionInfo ? (
            <div className="flex flex-col gap-2">
              <span>
                <p className="font-semibold">Host</p>

                <pre className="text-xs text-muted-foreground">
                  {connectionInfo?.host}
                </pre>
              </span>

              <span>
                <p className="font-semibold">Version</p>

                <pre className="text-xs text-muted-foreground">
                  {connectionInfo?.version}
                </pre>
              </span>
            </div>
          ) : connectionStatus === "NOT_CONNECTED" ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-center">Not connected</p>

              {server === undefined ? (
                <Button variant="outline">
                  <Link
                    to="."
                    search={(s) => ({
                      ...s,
                      configModal: {
                        open: true,
                        tab: "client",
                        clientTab: "connection",
                      },
                    })}
                  >
                    Manage Connection
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-foreground"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      predicate: (q) => q.queryKey.includes("connectionStatus"),
                    })
                  }
                >
                  Attempt to reconnect
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
