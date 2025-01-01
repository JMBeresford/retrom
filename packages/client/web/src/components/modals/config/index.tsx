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

  const tabItems: Record<
    NonNullable<typeof configModal>["tab"],
    { value: string; name: string }
  > = {
    server: { value: "server", name: "Server" },
    client: { value: "client", name: "Client" },
  };

  return (
    <Dialog
      open={!!configModal?.open}
      onOpenChange={(open) => {
        if (!open) {
          navigate({ search: { matchPlatformsModal: { open } } });
        }
      }}
    >
      <DialogContent className="pl-0 py-0 overflow-hidden">
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
            navigate({ search: { configModal: { open: true, tab } } });
          }}
          orientation="vertical"
        >
          <div className="grid grid-cols-[min-content,1fr] w-full">
            <div className="p-4 bg-muted mr-4">
              <TabsList className="flex-col gap-2 h-fit w-min">
                {Object.values(tabItems).map(({ value, name }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="text-md px-5 py-2"
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
