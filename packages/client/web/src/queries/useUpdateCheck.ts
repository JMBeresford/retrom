import { checkIsDesktop } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { check } from "@tauri-apps/plugin-updater";

export function useUpdateCheck() {
  return useQuery({
    queryKey: ["update-check"],
    queryFn: async () => {
      if (checkIsDesktop()) {
        try {
          const update = await check();
          return update;
        } catch (error) {
          console.error("Error checking for updates:", error);
          return null;
        }
      } else {
        return null;
      }
    },
  });
}
