import { checkIsDesktop } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { allSysInfo } from "tauri-plugin-system-info-api";

export function useSystemInfo() {
  const query = useQuery({
    queryFn: checkIsDesktop() ? allSysInfo : () => null,
    refetchInterval: 3000,
    queryKey: ["system-info"],
  });

  return query.data;
}
