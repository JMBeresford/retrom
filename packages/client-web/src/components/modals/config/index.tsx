import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@retrom/ui/components/dialog";
import { Tabs, TabsList, TabsTrigger } from "@retrom/ui/components/tabs";
import { Route as RootRoute } from "@/routes/__root";
import { useNavigate } from "@tanstack/react-router";
import { ServerConfigTab } from "./server";
import { ClientConfigTab } from "./client";

export function ConfigModal() {
  const navigate = useNavigate();
  const { configModal } = RootRoute.useSearch();
  type Tab = NonNullable<typeof configModal>["tab"];

  const tabItems: Record<Tab, { value: Tab; name: string }> = {
    server: { value: "server", name: "Server" },
    client: { value: "client", name: "Client" },
  };

  return (
    <Dialog
      modal
      open={!!configModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({
            to: ".",
            search: (prev) => ({ ...prev, configModal: undefined }),
          });
        }
      }}
    >
      <DialogContent className="gap-0">
        <DialogHeader>
          <DialogTitle>Retrom Configuration</DialogTitle>

          <DialogDescription>
            This is where you can configure your Retrom settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={configModal?.tab}
          onValueChange={(tab) => {
            navigate({
              to: ".",
              search: (prev) => ({
                ...prev,
                configModal: { open: true, tab: tab as Tab },
              }),
            }).catch(console.error);
          }}
          orientation="vertical"
        >
          <div className="flex flex-col w-full">
            <TabsList className="flex gap-2 h-fit w-full">
              {Object.values(tabItems).map(({ value, name }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-md w-full"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="py-4">
              <ServerConfigTab />
              <ClientConfigTab />
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
