import { GameDetails } from "./game-details";
import { redirect } from "next/navigation";
import { getGames } from "@/actions/grpc/games";
import { getPlatforms } from "@/actions/grpc/platforms";
import { GameDetailProvider } from "./game-context";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page(props: Props) {
  const { params } = props;
  const gamesResponse = await getGames({
    ids: [parseInt(params.id)],
    withMetadata: true,
  });

  const game = gamesResponse.games.at(0);
  const gameMetadata = gamesResponse.metadata.at(0);

  if (!game) {
    return redirect("/");
  }

  const platformsResponse = game.platformId
    ? await getPlatforms({ ids: [game.platformId], withMetadata: true })
    : { platforms: [], metadata: [] };

  const platform = platformsResponse.platforms.at(0);
  const platformMetadata = platformsResponse.metadata.at(0);

  const gameDetail = { game, platform, gameMetadata, platformMetadata };

  return (
    <GameDetailProvider value={gameDetail}>
      <GameDetails {...gameDetail} />
    </GameDetailProvider>
  );
}
