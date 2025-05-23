import type { InstallationStatus } from "@retrom/codegen/retrom/client/client-utils_pb";
import type { Game } from "@retrom/codegen/retrom/models/games_pb";
import { useMemo } from "react";
import { useInstallationStateQuery } from "./useInstallationState";

export function useInstallationQuery(game: Game) {
  const { data: _data, ...installationStateQuery } =
    useInstallationStateQuery();

  const data = useMemo(() => {
    const status =
      _data?.installationState.get(game.id) ?? InstallationStatus.UNRECOGNIZED;

    return status;
  }, [_data, game.id]);

  return {
    ...installationStateQuery,
    data,
  };
}
