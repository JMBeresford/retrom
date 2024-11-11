import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { init, setKeyMap } from "@noriginmedia/norigin-spatial-navigation";
import "./globals.scss";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | CSSProperties;
  }
}

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

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

  init({
    // debug: import.meta.env.DEV,
    // shouldFocusDOMNode: true,
    // domNodeFocusOptions: {
    //   preventScroll: true,
    //   focusVisible: true,
    // },
    shouldUseNativeEvents: true,
    // visualDebug: true,
    // distanceCalculationMethod: "center",
  });

  setKeyMap({
    // up: [87, 75], // w and k
    // down: [83, 74], // s and j
    // left: [65, 72], // a and h
    // right: [68, 76], // d and l
    // enter: 70, // f
    up: 1000,
    down: 1000,
    left: 1000,
    right: 1000,
    enter: 1000,
  });

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
