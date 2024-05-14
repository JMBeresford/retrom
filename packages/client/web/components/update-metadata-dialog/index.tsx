import { ComponentProps } from "react";
import { DialogContent, DialogHeader, DialogOverlay } from "../ui/dialog";
import {
  Game,
  GameMetadata,
  IgdbGameSearchQuery,
  MetadataServiceClient,
  MetadataServiceDefinition,
  Platform,
} from "@/generated/retrom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IgdbTab } from "./igdb-tab";
import { createChannel, createClient } from "nice-grpc";
import { revalidatePath } from "next/cache";
import { ManualTab } from "./manual-tab";

type Props = {
  game: Game;
  currentMetadata?: GameMetadata;
  platform?: Platform;
} & ComponentProps<typeof DialogContent>;

export function UpdateMetadataDialog(props: Props) {
  const { game, currentMetadata, platform, ...rest } = props;

  return (
    <DialogOverlay>
      <DialogContent {...rest}>
        <DialogHeader className="text-2xl font-black">
          Update Metadata
        </DialogHeader>

        <Tabs defaultValue="igdb">
          <TabsList>
            <TabsTrigger value="igdb">Search IGDB</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="igdb">
            <IgdbTab
              game={game}
              currentMetadata={currentMetadata}
              platform={platform}
              searchHandler={searchIgdb}
              updateHandler={updateMetadata}
            />
          </TabsContent>
          <TabsContent value="manual">
            <ManualTab
              updateHandler={updateMetadata}
              game={game}
              currentMetadata={currentMetadata}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </DialogOverlay>
  );
}

async function searchIgdb(query: IgdbGameSearchQuery) {
  "use server";
  const channel = createChannel("http://localhost:5001");
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    let res = await client.getIgdbGameSearchResults({ query, limit: 10 });
    return res.metadata;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}

async function updateMetadata(metadata: GameMetadata) {
  "use server";
  const channel = createChannel("http://localhost:5001");
  const client: MetadataServiceClient = createClient(
    MetadataServiceDefinition,
    channel,
  );

  try {
    await client.updateGameMetadata({ metadata: [metadata] });
    revalidatePath("/");
    return;
  } catch (error) {
    throw error;
  } finally {
    channel.close();
  }
}
