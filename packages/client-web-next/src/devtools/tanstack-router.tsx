import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";

const plugin: TanStackDevtoolsReactPlugin = {
  name: "Tanstack Router",
  render: <TanStackRouterDevtoolsPanel />,
};

export default plugin;
