import { configStore, useConfig } from "@/providers/config";
import { useCallback, useLayoutEffect } from "react";
import { toast } from "@retrom/ui/hooks/use-toast";
import { Button } from "@retrom/ui/components/button";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { useServerConfig } from "@/queries/useServerConfig";
import { create } from "@bufbuild/protobuf";
import { ServerConfig_TelemetryConfigSchema } from "@retrom/codegen/retrom/server/config_pb";
import { LoaderCircle } from "lucide-react";

export function TelemetryEnabledPrompt() {
  const completed = useConfig((s) => s.flowCompletions?.telemetryEnabled);
  const { data: serverConfig, status } = useServerConfig();
  const { mutate } = useUpdateServerConfig();

  const enable = useCallback(() => {
    if (!serverConfig?.config) return;

    mutate({
      config: {
        ...serverConfig.config,
        telemetry: create(ServerConfig_TelemetryConfigSchema, {
          ...serverConfig?.config?.telemetry,
          enabled: true,
        }),
      },
    });

    configStore.setState((s) => {
      s = {
        ...s,
        flowCompletions: {
          ...s.flowCompletions,
          telemetryEnabled: true,
        },
        telemetry: {
          ...s.telemetry,
          enabled: true,
        },
      };

      return s;
    });
  }, [mutate, serverConfig]);

  const decline = useCallback(() => {
    configStore.setState((s) => {
      s = {
        ...s,
        flowCompletions: {
          ...s.flowCompletions,
          telemetryEnabled: true,
        },
        telemetry: {
          ...s.telemetry,
          enabled: false,
        },
      };

      return s;
    });
  }, []);

  useLayoutEffect(() => {
    let dismiss: (() => void) | undefined;

    if (!completed) {
      dismiss = toast({
        title: "Help Retrom Improve",
        description:
          "Would you like to enable anonymous telemetry to help improve Retrom? You can always disable it again later in the settings.",
        action: (
          <div className="flex flex-col gap-2">
            <Button
              disabled={status !== "success"}
              onClick={enable}
              className="flex items-center gap-2"
            >
              {status !== "success" ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : null}
              Sure!
            </Button>

            <Button onClick={decline} variant="ghost">
              No thanks
            </Button>
          </div>
        ),
      }).dismiss;
    }

    return () => {
      dismiss?.();
    };
  });

  return <></>;
}
