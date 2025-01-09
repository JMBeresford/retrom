import { checkIsDesktop } from "@/lib/env";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { allSysInfo, AllSystemInfo } from "tauri-plugin-system-info-api";

export function useSystemInfo(): UseQueryResult<AllSystemInfo | null> {
  const query = useQuery({
    queryFn: checkIsDesktop() ? allSysInfo : () => null,
    refetchInterval: 3000,
    queryKey: ["system-info"],
  });

  return query;
}
