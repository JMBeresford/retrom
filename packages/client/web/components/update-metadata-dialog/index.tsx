import { ComponentProps } from "react";
import { DialogContent, DialogHeader, DialogOverlay } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IgdbTab } from "./igdb-tab";
import { ManualTab } from "./manual-tab";
import { searchIgdbGames, updateMetadata } from "@/actions/grpc/metadata";

type Props = ComponentProps<typeof DialogContent>;

export function UpdateMetadataDialog(props: Props) {
  return (
    <DialogOverlay>
      <DialogContent {...props}>
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
              searchHandler={searchIgdbGames}
              updateHandler={updateMetadata}
            />
          </TabsContent>
          <TabsContent value="manual">
            <ManualTab updateHandler={updateMetadata} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </DialogOverlay>
  );
}
