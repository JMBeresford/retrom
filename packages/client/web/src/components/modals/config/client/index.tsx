import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralConfig } from "./general-config";
import { ConnectionConfig } from "./connection-config";
import { checkIsDesktop, DesktopOnly } from "@/lib/env";
import { cn } from "@/lib/utils";

export function ClientConfigTab() {
  const tabItems = [
    { value: "general", name: "General", modes: ["desktop", "web"] },
    { value: "connection", name: "Connection", modes: ["desktop"] },
  ];

  const mode = checkIsDesktop() ? "desktop" : "web";

  return (
    <TabsContent
      value="client"
      className="flex flex-col gap-2 w-fit max-w-full  mt-0"
    >
      <DialogTitle className="text-xl font-extrabold">
        Client Configuration
      </DialogTitle>

      <DialogDescription>
        This is where you can configure your local Retrom client settings.
      </DialogDescription>

      <Tabs defaultValue="general">
        <TabsList className={cn("w-full", mode === "web" && "hidden")}>
          {tabItems.map(({ value, name, modes }) => (
            <TabsTrigger
              key={value}
              disabled={!modes.includes(mode)}
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

        <div className="mt-6">
          <GeneralConfig />
          <DesktopOnly>
            <ConnectionConfig />
          </DesktopOnly>
        </div>
      </Tabs>
    </TabsContent>
  );
}
