import { configStore, useConfig } from "@/providers/config";
import { useCallback, useLayoutEffect } from "react";
import { toast } from "@retrom/ui/hooks/use-toast";
import { useUpdateServerConfig } from "@/mutations/useUpdateServerConfig";
import { useServerConfig } from "@/queries/useServerConfig";
import { create } from "@bufbuild/protobuf";
import { ServerConfig_TelemetryConfigSchema } from "@retrom/codegen/retrom/server/config_pb";

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
    if (!completed && status !== "success") {
      toast({
        title: "Help Retrom Improve",
        id: "telemetry-prompt",
        description: (
          <p>
            Would you like to enable <strong>anonymous</strong> telemetry to
            help improve Retrom?
          </p>
        ),
        action: { label: "Sure!", onClick: enable },
        cancel: { label: "No, thanks", onClick: decline },
        duration: Infinity,
      });
    }
  });

  return <></>;
}
