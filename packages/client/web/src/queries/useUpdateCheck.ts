import { checkIsDesktop } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { check } from "@tauri-apps/plugin-updater";

export function useUpdateCheck() {
  return useQuery({
    queryKey: ["update-check"],
    queryFn: async () => {
      if (checkIsDesktop()) {
        check().then((update) => update);
      } else {
        return false;
      }
    },
  });
}
