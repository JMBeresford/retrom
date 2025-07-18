import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@retrom/ui/components/tabs";
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
      open={!!updateMetadataModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({ ...prev, updateMetadataModal: undefined }),
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Metadata</DialogTitle>
          <DialogDescription>
            Update the metadata entries for this game, either by searching IGDB
            or manually.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={game.thirdParty ? "manual" : "igdb"}>
          <TabsList className="w-full *:w-full">
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
