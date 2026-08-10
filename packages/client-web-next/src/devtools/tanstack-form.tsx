import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import type { TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";

const plugin: TanStackDevtoolsReactPlugin = {
  name: "Tanstack Form",
  render: <FormDevtoolsPanel />,
};

export default plugin;
