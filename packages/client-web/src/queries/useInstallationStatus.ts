import { useInstallationIndex } from "@/providers/installation-index";
import { InstallationStatus } from "@retrom/codegen/retrom/client/installation_pb";
import { useMemo } from "react";

export function useInstallationStatus(gameId: number) {
  const { installations } = useInstallationIndex();
  const status = useMemo(
    () => installations[gameId] ?? InstallationStatus.NOT_INSTALLED,
    [installations, gameId],
  );

  console.log({ status });

  return status;
}
