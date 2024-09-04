import { createLazyFileRoute } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SetupModalSteps } from "../../components/prompts/setup/steps";
import { SetupModalProvider } from "../../components/prompts/setup/context";

export const Route = createLazyFileRoute("/setup/")({
  component: SetupModal,
});

function SetupModal() {
  return (
    <SetupModalProvider>
      <Dialog open={true}>
        <DialogContent userCanClose={false}>
          <SetupModalSteps />
        </DialogContent>
      </Dialog>
    </SetupModalProvider>
  );
}
