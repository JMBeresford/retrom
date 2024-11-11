import { checkIsDesktop } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { check, Update } from "@tauri-apps/plugin-updater";

export function useUpdateCheck() {
  return useQuery({
    queryKey: ["update-check"],
    queryFn: async () => {
      if (checkIsDesktop()) {
        check().then((update) => update);
      } else {
        return new Update({
          rid: -1,
          version: "0.0.0",
          available: false,
          currentVersion: "0.0.0",
        });
      }
    },
  });
}
