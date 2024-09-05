import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { IgdbTab } from "./igdb-tab";
import { ManualTab } from "./manual-tab";
import { Route } from "@/routes/games/$gameId";

export function UpdateMetadataModal() {
  const { updateMetadataModal } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <Dialog
      open={updateMetadataModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { updateMetadataModal: undefined } });
        }
      }}
    >
      <DialogContent>
        <DialogHeader className="text-2xl font-black">
          <DialogTitle>Update Metadata</DialogTitle>
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
