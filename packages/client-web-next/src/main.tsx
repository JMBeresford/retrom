import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";
import {
  StateFlags,
  restoreStateCurrent,
} from "@tauri-apps/plugin-window-state";
import { IS_DESKTOP } from "./env";
import { ConfigProvider } from "./config/provider";
import { RetromClientProvider } from "./api-client/provider";
import { App } from "./app";

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  if (IS_DESKTOP) {
    await restoreStateCurrent(StateFlags.ALL);
  }

  try {
    root.render(
      <StrictMode>
        <ConfigProvider>
          <RetromClientProvider>
            <App />
          </RetromClientProvider>
        </ConfigProvider>
      </StrictMode>,
    );
  } catch (error) {
    console.log({ error });
  }
}
