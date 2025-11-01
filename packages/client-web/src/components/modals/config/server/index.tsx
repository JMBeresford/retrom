import {
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
import { ServerConfigJson } from "@retrom/codegen/retrom/server/config_pb";
import { useServerConfig } from "@/queries/useServerConfig";
import { LoaderCircle } from "lucide-react";
import { IgdbConfig } from "./igdb-config";
import { SteamConfig } from "./steam-config";
import { SavesConfig } from "./saves-config";
import { LibrariesConfig } from "./libraries-config";
import { TelemetryConfig } from "./telemetry-config";
import { z } from "zod";
import { Route as RootRoute } from "@/routes/__root";
import { MetadataConfig } from "./metadata-config";

type ServerTabs = Exclude<keyof ServerConfigJson, "connection">;
export const serverConfigTabSchema = z
  .enum([
    "contentDirectories",
    "igdb",
    "steam",
    "saves",
    "telemetry",
    "metadata",
  ] as const satisfies ServerTabs[])
  .default("contentDirectories");

const tabItems: Record<ServerTabs, { value: ServerTabs; name: string }> = {
  contentDirectories: {
    value: "contentDirectories",
    name: "Content Directories",
  },
  metadata: { value: "metadata", name: "Metadata" },
  igdb: { value: "igdb", name: "IGDB" },
  steam: { value: "steam", name: "Steam" },
  saves: { value: "saves", name: "Cloud Saves" },
  telemetry: { value: "telemetry", name: "Telemetry" },
};

export function ServerConfigTab() {
  const { data, status } = useServerConfig();
  const tab = RootRoute.useSearch({ select: (s) => s.configModal?.serverTab });

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
        <Tabs defaultValue={tab ?? "contentDirectories"} className="w-full">
          <TabsList className="w-full">
            {Object.values(tabItems).map(({ value, name }) => (
              <TabsTrigger key={value} value={value} className="w-full text-sm">
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* <Separator className="mt-4" /> */}

          <LibrariesConfig currentConfig={data.config} />
          <MetadataConfig currentConfig={data.config} />
          <IgdbConfig currentConfig={data.config} />
          <SteamConfig currentConfig={data.config} />
          <SavesConfig currentConfig={data.config} />
          <TelemetryConfig />
        </Tabs>
      )}
    </TabsContent>
  );
}
