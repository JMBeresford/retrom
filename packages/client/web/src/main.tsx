import { StrictMode, CSSProperties as ReactCSSProperties } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./globals.scss";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | ReactCSSProperties;
    [key: `-${string}`]: string | number | ReactCSSProperties;
  }
}

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { checkIsDesktop } from "./lib/env";
import {
  restoreStateCurrent,
  StateFlags,
} from "@tauri-apps/plugin-window-state";
import { scan } from "react-scan";

if (import.meta.env.DEV) {
  scan();
}

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  if (checkIsDesktop()) {
    await restoreStateCurrent(StateFlags.ALL);
  }

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
