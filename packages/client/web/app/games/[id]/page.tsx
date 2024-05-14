import { GameDetails } from "./game-details";
import { Dialog } from "@/components/ui/dialog";
import { Client, ClientError, createChannel, createClient } from "nice-grpc";
import {
  GameServiceDefinition,
  PlatformServiceDefinition,
} from "@/generated/retrom";
import { redirect } from "next/navigation";
import { UpdateMetadataDialog } from "@/components/update-metadata-dialog";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page(props: Props) {
  const { params } = props;
  const data = await getGame(parseInt(params.id));
  const game = data?.game;
  const metadata = data?.metadata;

  if (!game) {
    redirect("/");
  }

  const platform = await getPlatform(game.platformId);

  return (
    <div className="">
      <Dialog>
        <GameDetails game={game} metadata={metadata} />

        <UpdateMetadataDialog
          game={game}
          platform={platform}
          currentMetadata={metadata}
        />
      </Dialog>
    </div>
  );
}

async function getGame(id: number) {
  const channel = createChannel("http://localhost:5001");
  const client: Client<GameServiceDefinition> = createClient(
    GameServiceDefinition,
    channel,
  );

  try {
    const getGamesResponse = await client.getGames({
      ids: [id],
      withMetadata: true,
    });

    channel.close();

    const game = getGamesResponse.games[0];
    const metadata = getGamesResponse.metadata.find((md) => md.gameId === id);

    return { game, metadata };
  } catch (error) {
    if (error instanceof ClientError) {
      console.error(error);
    }
  }
}

async function getPlatform(id?: number) {
  if (!id) {
    return;
  }

  const channel = createChannel("http://localhost:5001");
  const client: Client<PlatformServiceDefinition> = createClient(
    PlatformServiceDefinition,
    channel,
  );

  try {
    const getPlatformsResponse = await client.getPlatforms({
      ids: [id],
    });

    channel.close();

    return getPlatformsResponse.platforms[0];
  } catch (error) {
    if (error instanceof ClientError) {
      console.error(error);
    }
  }
}
