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
import { Route } from "@/routes/(windowed)/_layout/games/$gameId";
import { useGameDetail } from "@/providers/game-details";

export function UpdateMetadataModal() {
  const { updateMetadataModal } = Route.useSearch();
  const navigate = useNavigate();
  const { game } = useGameDetail();

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

        <Tabs defaultValue={game.thirdParty ? "manual" : "igdb"}>
          <TabsList>
            <TabsTrigger disabled={game.thirdParty} value="igdb">
              Search IGDB
            </TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          {!game.thirdParty && (
            <TabsContent value="igdb">
              <IgdbTab />
            </TabsContent>
          )}
          <TabsContent value="manual">
            <ManualTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
