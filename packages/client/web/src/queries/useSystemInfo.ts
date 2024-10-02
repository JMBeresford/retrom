import { checkIsDesktop } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";
import { allSysInfo } from "tauri-plugin-system-info-api";

export function useSystemInfo() {
  const isDesktop = checkIsDesktop();

  const query = useQuery({
    queryFn: isDesktop ? allSysInfo : () => undefined,
    refetchInterval: 3000,
    queryKey: ["system-info"],
  });

  return query.data;
}
