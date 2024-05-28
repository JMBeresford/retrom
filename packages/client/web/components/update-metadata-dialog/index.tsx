import { ComponentProps } from "react";
import { DialogContent, DialogHeader, DialogOverlay } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IgdbTab } from "./igdb-tab";
import { ManualTab } from "./manual-tab";

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
            <IgdbTab />
          </TabsContent>
          <TabsContent value="manual">
            <ManualTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </DialogOverlay>
  );
}
