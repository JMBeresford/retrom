import { parseVersion } from "@/components/prompts/version-checks/utils";
import { Version } from "@/generated/retrom/server/server-info";
import { isDesktop } from "@/lib/env";
import { readLocalCargoToml } from "@/lib/node-utils";
import { DefaultError, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getVersion } from "@tauri-apps/api/app";

type FnData = Version;

export function useClientVersion<Err = DefaultError, Data = FnData>(
  opts: Omit<UseQueryOptions<FnData, Err, Data>, "queryFn" | "queryKey"> = {},
) {
  const queryOpts: UseQueryOptions<FnData, Err, Data> = {
    ...opts,
    queryKey: ["client-version"],
    queryFn: isDesktop()
      ? async () => parseVersion(await getVersion())
      : async () => {
          if (process.env.NODE_ENV === "development") {
            return await readLocalCargoToml();
          }

          const version =
            process.env.RETROM_VERSION ||
            process.env.NEXT_PUBLIC_RETROM_VERSION;
          if (!version) {
            throw new Error("No version found");
          }

          return parseVersion(version);
        },
  };

  return useQuery({
    ...queryOpts,
  });
}
