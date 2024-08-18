"use client";

import { ServerHostStep } from "./server-host";
import { Step, useSetupModal } from "./context";
import { Confirm } from "./confirm";
import { ClientName } from "./client-name";

const RenderStep: Record<Step, JSX.Element> = {
  "server-host": <ServerHostStep />,
  "client-name": <ClientName />,
  confirm: <Confirm />,
  done: <></>,
};

export function SetupModalSteps() {
  const { step } = useSetupModal();

  return <div>{RenderStep[step]}</div>;
}
