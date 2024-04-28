import { Game, GetGamesResponse } from "@/generated/retrom";
import { useGameClient } from "@/providers/games_provider";
import { useEffect, useState } from "react";

type GameOptions = {
  platformIds?: Array<string>;
  ids?: Array<string>;
  withMetadata?: boolean;
  withFiles?: boolean;
};

export function useGames(opts?: GameOptions) {
  const client = useGameClient();
  const [games, setGames] = useState<GetGamesResponse>();

  useEffect(() => {
    client
      .getGames({
        platformIds: opts?.platformIds,
        withMetadata: opts?.withMetadata,
        ids: opts?.ids,
      })
      .then((res) => setGames(res))
      .catch((error) => console.error(error));
  }, [client, opts]);

  return games;
}
