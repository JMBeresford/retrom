import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Route as RootRoute } from "@/routes/__root";
import { useNavigate } from "@tanstack/react-router";
import { ServerConfigTab } from "./server";
import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
      <DialogContent className="sm:pl-0 sm:py-0 overflow-hidden">
        {/* Allow the tabs to define their own headers, visually.
        Keep this for screen readers, accessibility etc but hide it */}
        <VisuallyHidden>
          <DialogTitle className="text-xl font-extrabold">
            Retrom Configuration
          </DialogTitle>

          <DialogDescription>
            This is where you can configure your Retrom settings.
          </DialogDescription>
        </VisuallyHidden>

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
          <div className="flex flex-col sm:grid grid-cols-[min-content,1fr] w-full">
            <div className="pt-4 sm:p-4 sm:bg-muted sm:mr-4">
              <TabsList className="flex sm:flex-col gap-2 h-fit w-full">
                {Object.values(tabItems).map(({ value, name }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="text-md px-5 py-2 w-full"
                  >
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

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
