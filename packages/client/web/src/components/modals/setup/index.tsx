import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SetupModalProvider } from "./context";
import { SetupModalSteps } from "./steps";
import { Route as RootRoute } from "@/routes/__root";

export function SetupModal() {
  const { setupModal } = RootRoute.useSearch();

  return (
    <Dialog open={setupModal?.open}>
      <SetupModalProvider>
        <DialogContent userCanClose={false}>
          <SetupModalSteps />
        </DialogContent>
      </SetupModalProvider>
    </Dialog>
  );
}
