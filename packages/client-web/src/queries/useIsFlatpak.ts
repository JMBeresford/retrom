import { isFlatpak } from "@retrom/plugin-config";
import { useQuery } from "@tanstack/react-query";

export function useIsFlatpak() {
  return useQuery({
    queryFn: () => isFlatpak(),
    queryKey: ["isFlatpak"],
  });
}
