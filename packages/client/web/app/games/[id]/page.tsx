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
  const { games, metadata } = await getGames({
    ids: [parseInt(params.id)],
    withMetadata: true,
  });

  const game = games.at(0);
  const gameMetadata = metadata.at(0);

  if (!game) {
    return redirect("/");
  }

  const { platforms } = game.platformId
    ? await getPlatforms({ ids: [game.platformId] })
    : { platforms: [] };

  const platform = platforms.at(0);

  const gameDetail = { game, platform, metadata: gameMetadata };

  return (
    <GameDetailProvider value={gameDetail}>
      <GameDetails {...gameDetail} />
    </GameDetailProvider>
  );
}
