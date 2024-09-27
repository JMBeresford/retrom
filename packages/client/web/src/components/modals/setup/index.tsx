import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SetupModalProvider } from "./context";
import { SetupModalSteps } from "./steps";
import { Route as RootRoute } from "@/routes/__root";
import { DesktopOnly } from "@/lib/env";

export function SetupModal() {
  const { setupModal } = RootRoute.useSearch();

  return (
    <DesktopOnly>
      <Dialog open={setupModal?.open}>
        <SetupModalProvider>
          <DialogContent userCanClose={false}>
            <SetupModalSteps />
          </DialogContent>
        </SetupModalProvider>
      </Dialog>
    </DesktopOnly>
  );
}
