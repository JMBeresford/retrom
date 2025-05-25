import { GameSchema } from "@retrom/codegen/retrom/models/games_pb";
import { useMemo } from "react";
import { useInstallationStateQuery } from "./useInstallationState";
import { MessageShape } from "@bufbuild/protobuf";

export function useInstallationQuery(game: MessageShape<typeof GameSchema>) {
  const { data: _data, ...installationStateQuery } =
    useInstallationStateQuery();

  const data = useMemo(() => {
    if (!_data?.installationState) {
      return undefined;
    }

    return _data.installationState[game.id];
  }, [_data, game]);

  return {
    ...installationStateQuery,
    data,
  };
}
