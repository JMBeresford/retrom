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
import { GeneralConfig } from "./general-config";
import { ConnectionConfig } from "./connection-config";
import { checkIsDesktop, DesktopOnly } from "@/lib/env";
import { cn } from "@retrom/ui/lib/utils";
import { z } from "zod";
import { Route as RootRoute } from "@/routes/__root";

export const clientConfigTabSchema = z
  .enum(["general", "connection"])
  .default("general");

export function ClientConfigTab() {
  const tab = RootRoute.useSearch({ select: (s) => s.configModal?.clientTab });

  const tabItems: Array<{
    value: z.infer<typeof clientConfigTabSchema>;
    name: string;
    modes: string[];
  }> = [
    { value: "general", name: "General", modes: ["desktop", "web"] },
    { value: "connection", name: "Connection", modes: ["desktop"] },
  ];

  const mode = checkIsDesktop() ? "desktop" : "web";

  return (
    <TabsContent
      value="client"
      className="flex flex-col gap-2 w-full sm:w-fit max-w-full mt-0"
    >
      <DialogHeader>
        <DialogTitle className="text-xl font-extrabold">
          Client Configuration
        </DialogTitle>

        <DialogDescription>
          This is where you can configure your local Retrom client settings.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue={tab}>
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
