import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { IgdbTab } from "./igdb-tab";
import { ManualTab } from "./manual-tab";
import { Route } from "@/routes/(windowed)/_layout.games/$gameId";

export function UpdateMetadataModal() {
  const { updateMetadataModal } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <Dialog
      modal
      open={updateMetadataModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { updateMetadataModal: undefined } });
        }
      }}
    >
      <DialogContent handleScroll={false}>
        <DialogHeader>
          <DialogTitle>Update Metadata</DialogTitle>
          <DialogDescription>
            Update the metadata entries for this game, either by searching IGDB
            or manually.
          </DialogDescription>
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
    </Dialog>
  );
}
