import { ServerHostStep } from "./server-host";
import { Step, useSetupModal } from "./context";
import { Confirm } from "./confirm";
import { ClientName } from "./client-name";

const RenderStep: Record<Step, JSX.Element> = {
  ServerHost: <ServerHostStep />,
  ClientName: <ClientName />,
  Confirm: <Confirm />,
};

export function SetupModalSteps() {
  const { step } = useSetupModal();

  return <div>{RenderStep[step]}</div>;
}
