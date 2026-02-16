import { StrictMode, CSSProperties as ReactCSSProperties } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./globals.css";

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

// Create a new router instance
const router = createRouter({
  routeTree,
  basepath: import.meta.env.VITE_BASE_URL,
});

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

  try {
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  } catch (error) {
    console.log({ error });
  }
}
