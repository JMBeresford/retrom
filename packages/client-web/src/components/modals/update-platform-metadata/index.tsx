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
import { Route as RootRoute } from "@/routes/__root";
import { usePlatforms } from "@/queries/usePlatforms";
import { LoaderCircle } from "lucide-react";
import { ManualTab } from "./manual-tab";

export function UpdatePlatformMetadataModal() {
  const { updatePlatformMetadataModal } = RootRoute.useSearch();
  const navigate = useNavigate();

  const { data } = usePlatforms({
    request: {
      ids: [updatePlatformMetadataModal?.id ?? -1],
      withMetadata: true,
    },
  });

  const platform = data?.platforms.at(0);

  return (
    <Dialog
      modal
      open={!!updatePlatformMetadataModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({
              ...prev,
              updatePlatformMetadataModal: undefined,
            }),
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Platform Metadata</DialogTitle>
          <DialogDescription>
            Update the metadata entries for this platform, either by searching
            IGDB or manually.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="igdb">
          <TabsList className="w-full *:w-full">
            <TabsTrigger value="igdb" disabled={!platform}>
              Search IGDB
            </TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="igdb">
            {platform ? (
              <IgdbTab
                platform={platform}
                currentMetadata={data?.metadata.at(0)}
              />
            ) : (
              <LoaderCircle className="animate-spin" />
            )}
          </TabsContent>
          <TabsContent value="manual">
            {platform ? (
              <ManualTab
                platform={platform}
                platformMetadata={data?.metadata.at(0)}
              />
            ) : (
              <LoaderCircle className="animate-spin" />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
