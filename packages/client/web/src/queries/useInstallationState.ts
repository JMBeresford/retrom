import {
  InstallationState,
  InstallationStatus,
} from "@/generated/retrom/client/client-utils";
import { checkIsDesktop } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useInstallationStateQuery() {
  const query = useQuery({
    queryFn: async () => {
      try {
        if (!checkIsDesktop()) return InstallationState.create();

        const data = await invoke<InstallationState>(
          "plugin:installer|get_installation_state",
        );

        // serde encodes maps as objects, so we need to cast it to a map
        const notMap = data.installationState as unknown as Record<
          string | number,
          InstallationStatus
        >;

        data.installationState = new Map(
          Object.entries(notMap).map(([k, v]) => [parseInt(k), v]),
        );

        return data;
      } catch (error) {
        console.error(error);
      }
    },
    throwOnError: true,
    queryKey: ["installation-state"],
  });

  return query;
}
