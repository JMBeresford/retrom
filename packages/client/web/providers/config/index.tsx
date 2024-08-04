"use client";

import { RetromClientConfig } from "@/generated/retrom/client/client-config";
import { createContext, PropsWithChildren, useContext } from "react";
import { defaultAPIHostname, defaultAPIPort } from "./utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WebConfigManager } from "./web";
import { DeepRequired } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export interface ConfigManager {
  setConfig(config: DeepRequired<RetromClientConfig>): Promise<void>;
  getConfig(): Promise<DeepRequired<RetromClientConfig>>;
}

const context = createContext<ConfigManager | undefined>(undefined);

export function ConfigProvider(props: PropsWithChildren<{}>) {
  const { children } = props;

  // TODO: use a config file on the desktop client
  const manager = WebConfigManager;

  return <context.Provider value={manager}>{children}</context.Provider>;
}

export function useConfig() {
  const manager = useContext(context);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!manager) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  const config = useQuery({
    queryKey: ["config"],
    queryFn: manager.getConfig,
  });

  const { mutate } = useMutation({
    mutationFn: manager.setConfig,
    onSuccess: () => {
      toast({
        title: "Configuration updated",
        description: "Configuration has been updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });

  return {
    config,
    setConfig: mutate,
  };
}

export const defaultConfig: DeepRequired<RetromClientConfig> = {
  server: { hostname: defaultAPIHostname(), port: defaultAPIPort() },
};
