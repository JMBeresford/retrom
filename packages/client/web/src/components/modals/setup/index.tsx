import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SetupModalProvider } from "./context";
import { SetupModalSteps } from "./steps";
import { Route as RootRoute } from "@/routes/__root";
import { checkIsDesktop, DesktopOnly } from "@/lib/env";
import { Navigate } from "@tanstack/react-router";
import { useConfig } from "@/providers/config";

export function SetupModal() {
  const { setupModal } = RootRoute.useSearch();
  const { setupComplete } = useConfig((store) => store.flowCompletions) ?? {};

  if (!setupComplete && !setupModal?.open && checkIsDesktop()) {
    return <Navigate search={{ setupModal: { open: true } }} />;
  }

  return (
    <DesktopOnly>
      <Dialog open={!!setupModal?.open}>
        <SetupModalProvider>
          <DialogContent userCanClose={false}>
            <SetupModalSteps />
          </DialogContent>
        </SetupModalProvider>
      </Dialog>
    </DesktopOnly>
  );
}
