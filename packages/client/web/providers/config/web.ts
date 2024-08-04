"use client";

import { RetromClientConfig } from "@/generated/retrom/client/client-config";
import { ConfigManager, defaultConfig } from ".";
import { DeepRequired } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { configSchema } from "./utils";

const STORAGE_KEY = "retrom-client-config";

type WebConfigManager = ConfigManager & {
  reset(): DeepRequired<RetromClientConfig>;
};

export const WebConfigManager = {
  async getConfig(): Promise<DeepRequired<RetromClientConfig>> {
    const config = localStorage.getItem(STORAGE_KEY);

    try {
      if (!config) {
        const msg =
          "No config found in local storage, using default config. This is likely a bug.";
        console.warn(msg);

        return WebConfigManager.reset();
      }

      return configSchema.parse(JSON.parse(config));
    } catch (e) {
      const msg =
        "Invalid config found in local storage, using default config. This is likely a bug.";
      console.error(msg);
      toast({
        variant: "destructive",
        description: msg,
        title: "Load Config Error",
      });

      return WebConfigManager.reset();
    }
  },

  async setConfig(config: RetromClientConfig): Promise<void> {
    try {
      const parsed = configSchema.parse(config);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      const msg =
        "Tried to save an invalid config. This is likely a bug. Please report this issue.";
      console.error(msg, config);
      toast({
        variant: "destructive",
        description: msg,
        title: "Save Config Error",
      });
    }
  },

  reset(): DeepRequired<RetromClientConfig> {
    try {
      const parsed = configSchema.parse(defaultConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      const msg =
        "Invalid default config found, this is likely a bug. Please report this issue. Using empty config instead.";
      console.error(msg);

      throw e;
    }
  },
};
