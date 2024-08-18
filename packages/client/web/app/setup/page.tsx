import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SetupModalSteps } from "./steps";
import { SetupModalProvider } from "./context";

export default function Page() {
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
