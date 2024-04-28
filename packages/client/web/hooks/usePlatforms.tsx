import { GetPlatformsResponse, Platform } from "@/generated/retrom";
import { usePlatformClient } from "@/providers/platforms_provider";
import { useEffect, useState } from "react";

type PlatformOptions = {
  ids?: Array<string>;
};

export function usePlatforms(opts?: PlatformOptions) {
  const client = usePlatformClient();
  const [platforms, setPlatforms] = useState<GetPlatformsResponse>();

  useEffect(() => {
    client
      .getPlatforms({ ids: opts?.ids })
      .then((res) => setPlatforms(res))
      .catch((error) => console.error(error));
  }, [client, opts]);

  return platforms;
}
