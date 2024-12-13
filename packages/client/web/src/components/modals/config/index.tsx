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
      <DialogContent>
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

        <DialogContent>
          <Tabs
            className="flex gap-8 relative"
            value={configModal?.tab}
            onValueChange={(tab) => {
              navigate({ search: { configModal: { open: true, tab } } });
            }}
            orientation="vertical"
          >
            <TabsList className="flex-col gap-2 h-fit">
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

            <ServerConfigTab />
            <ClientConfigTab />
          </Tabs>
        </DialogContent>
      </DialogContent>
    </Dialog>
  );
}
