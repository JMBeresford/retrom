import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ConnectionStatus,
  useConnectionStatus,
} from "@/queries/useConnectionStatus";
import { PopoverProps } from "@radix-ui/react-popover";
import { useQueryClient } from "@tanstack/react-query";
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
              <p className="font-semibold">
                Host
                <pre className="text-xs text-muted-foreground">
                  {connectionInfo?.host}
                </pre>
              </p>

              <p className="font-semibold">
                Version
                <pre className="text-xs text-muted-foreground">
                  {connectionInfo?.version}
                </pre>
              </p>
            </div>
          ) : connectionStatus === "NOT_CONNECTED" ? (
            <div className="text-muted-foreground flex flex-col gap-2">
              <p>Not connected</p>

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
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
