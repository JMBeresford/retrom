import { useEmulatorJS } from "@/providers/emulator-js";
import { useRetromClient } from "@/providers/retrom-client";
import { useRemoteFiles } from "@/routes/play/$gameId/_layout/-utils/useRemoteFiles";
import { FileStat } from "@retrom/codegen/retrom/files";
import { useQuery } from "@tanstack/react-query";

export type StateInfo = {
  state?: Uint8Array;
  screenshot?: string;
  stat: FileStat;
};

export function useEJSSaveState(slot: number, gameId: number) {
  const emulatorJS = useEmulatorJS();
  const retromClient = useRetromClient();
  const { getPublicUrl } = useRemoteFiles();
  const core = emulatorJS.coreName;

  return useQuery({
    queryKey: ["save-state", { core, slot, gameId }],
    structuralSharing: false,
    queryFn: async () => {
      const path = `states/${core}/${gameId}/`;
      const { stats } = await retromClient.fileExplorerClient.getStat({ path });

      const stat = stats.find((stat) => stat.path.endsWith(`${slot}.state`));
      if (!stat) {
        return null;
      }

      const info: StateInfo = {
        stat,
        screenshot: stats.find((s) => s.path.endsWith(`${slot}.png`))?.path,
      };

      const state = await fetch(getPublicUrl(stat.path)).then(async (res) => {
        if (!res.ok) {
          return;
        }

        return new Uint8Array(await res.arrayBuffer());
      });

      if (!state) {
        throw new Error("Failed to fetch state file");
      }

      info.state = state;
      return info;
    },
  });
}
