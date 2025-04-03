import { DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServerConfig } from "@/queries/useServerConfig";
import { DialogTitle } from "@radix-ui/react-dialog";
import { LoaderCircle } from "lucide-react";
import { IgdbConfig } from "./igdb-config";
import { SteamConfig } from "./steam-config";
import { LibrariesConfig } from "./libraries-config";

type ServerTabs = Exclude<keyof ServerConfig, "connection">;

export function ServerConfigTab() {
  const tabItems: Record<ServerTabs, { value: ServerTabs; name: string }> = {
    contentDirectories: {
      value: "contentDirectories",
      name: "Content Directories",
    },
    igdb: { value: "igdb", name: "IGDB" },
    steam: { value: "steam", name: "Steam" },
  };

  const { data, status } = useServerConfig();

  function LoadingState() {
    return (
      <div className="grid place-items-center py-8">
        <LoaderCircle className="w-auto h-[6rem] text-muted-foreground animate-spin stroke-1" />
      </div>
    );
  }

  function ErrorState() {
    return (
      <div className="grid place-items-center py-8 text-muted-foreground">
        <p>😔 Error loading server config </p>
      </div>
    );
  }

  return (
    <TabsContent
      value="server"
      className="flex flex-col gap-2 w-fit max-w-full mt-0"
    >
      <DialogHeader>
        <DialogTitle className="text-xl font-extrabold">
          Server Configuration
        </DialogTitle>

        <DialogDescription className="text-pretty max-w-[60ch]">
          This is where you can configure your Retrom server settings. Settings
          here are shared by all clients connected to your server.
        </DialogDescription>
      </DialogHeader>

      {status === "pending" ? (
        <LoadingState />
      ) : status === "error" || !data?.config ? (
        <ErrorState />
      ) : (
        <Tabs defaultValue="contentDirectories" className="w-full">
          <TabsList className="w-full">
            {Object.values(tabItems).map(({ value, name }) => (
              <TabsTrigger
                key={value}
                value={value}
                style={{
                  flexBasis: `calc(1 / ${Object.values(tabItems).length} * 100%)`,
                }}
                className="text-sm"
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* <Separator className="mt-4" /> */}

          <LibrariesConfig currentConfig={data.config} />
          <IgdbConfig currentConfig={data.config} />
          <SteamConfig currentConfig={data.config} />
        </Tabs>
      )}
    </TabsContent>
  );
}
