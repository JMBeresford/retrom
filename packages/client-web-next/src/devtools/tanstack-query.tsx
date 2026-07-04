import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type { TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";

const plugin: TanStackDevtoolsReactPlugin = {
  name: "Tanstack Query",
  render: <ReactQueryDevtoolsPanel />,
};

export default plugin;
