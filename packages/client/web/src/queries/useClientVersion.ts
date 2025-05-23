import type { parseVersion } from "@/lib/version-utils";
import { Version } from "@retrom/codegen/retrom/server/server-info_pb";
import { checkIsDesktop } from "@/lib/env";
import { DefaultError, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getVersion } from "@tauri-apps/api/app";

type FnData = Version;

export function useClientVersion<Err = DefaultError, Data = FnData>(
  opts: Omit<UseQueryOptions<FnData, Err, Data>, "queryFn" | "queryKey"> = {},
) {
  const queryOpts: UseQueryOptions<FnData, Err, Data> = {
    ...opts,
    queryKey: ["client-version"],
    queryFn: async () => {
      if (import.meta.env.SSR) {
        const { readLocalCargoToml } = await import("@/lib/node-utils");

        return (
          parseVersion(readLocalCargoToml()) ?? {
            major: 0,
            minor: 0,
            patch: 0,
          }
        );
      }

      if (checkIsDesktop()) {
        const version = parseVersion(await getVersion());
        if (!version) {
          throw new Error("No version found");
        }

        return version;
      }

      const version = parseVersion(
        import.meta.env.RETROM_VERSION || import.meta.env.VITE_RETROM_VERSION,
      );

      if (!version) {
        throw new Error("No version found");
      }

      return version;
    },
  };

  return useQuery({
    ...queryOpts,
  });
}
