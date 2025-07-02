import { Callout } from "@/components/callout";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { useServerConfig } from "@/queries/useServerConfig";
import { create } from "@bufbuild/protobuf";
import { ServerConfig_TelemetryConfigSchema } from "@retrom/codegen/retrom/server/config_pb";
import { LoaderCircle } from "lucide-react";

export function TelemetryConfig() {
  const { data, status } = useServerConfig();
  const { mutate, status: updateStatus } = useUpdateServerConfig();

  return (
    <TabsContent value="telemetry" className="pb-4">
      <div className="my-4 max-w-[55ch]">
        <p className="text-muted-foreground text-sm">
          If you want to help improve Retrom, you can enable telemetry. This
          will send ephemeral, <strong>anonymous</strong> usage data which
          tracks things like network latency, performance metrics and errors.
        </p>
      </div>

      {status === "pending" ? (
        <LoaderCircle className="animate-spin" />
      ) : status === "error" ? (
        <Callout variant="destructive">
          Could not load telemetry configuration. Please try again later.
        </Callout>
      ) : (
        <div className="flex items-top gap-2">
          <Checkbox
            disabled={updateStatus === "pending"}
            id="server-telemetry-enabled"
            checked={data.config?.telemetry?.enabled}
            onCheckedChange={(val) => {
              if (data.config) {
                mutate({
                  config: {
                    ...data.config,
                    telemetry: create(ServerConfig_TelemetryConfigSchema, {
                      ...data.config.telemetry,
                      enabled: !!val,
                    }),
                  },
                });
              }
            }}
          />
          <div className={cn("grid gap-1 5 leading-none")}>
            <label htmlFor="server-telemetry-enabled">
              Enable Telemetry
              <span className="text-xs text-muted-foreground ml-1">
                (requires restart)
              </span>
            </label>

            <p className="text-sm text-muted-foreground">
              Send server telemetry data to help improve Retrom.
            </p>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
