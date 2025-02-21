import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { readConfigFile, readLocalCargoToml } from "./src/lib/node-utils";
import { glslify } from "vite-plugin-glslify";

let localVersion = "0.0.0";
try {
  const cargoTomlVersion = readLocalCargoToml();
  localVersion = cargoTomlVersion;
} catch (e) {
  if (process.env.NODE_ENV === "development") {
    console.error("Failed to read local Cargo.toml:", e);
  }
}

let localServicePort = "5101";
const localServiceHostname = "http://localhost";

const config = readConfigFile();
if (config?.connection?.port) {
  localServicePort = config.connection.port.toString();
}

const localServiceHost =
  process.env.VITE_RETROM_LOCAL_SERVICE_HOST ||
  process.env.RETROM_LOCAL_SERVICE_HOST ||
  `${localServiceHostname}:${localServicePort}`;

const base =
  process.env.VITE_RETROM_BASE_PATH || process.env.RETROM_BASE_PATH || "./";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "import.meta.env.VITE_RETROM_VERSION": JSON.stringify(localVersion),
    "import.meta.env.VITE_RETROM_LOCAL_SERVICE_HOST":
      JSON.stringify(localServiceHost),
    "import.meta.env.VITE_RETROM_LOCAL_SERVICE_PORT":
      JSON.stringify(localServicePort),
  },
  base,
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: localServiceHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: localServiceHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    target: [
      "es2022",
      "chrome89",
      "edge89",
      "safari15",
      "firefox89",
      "opera75",
    ],
  },
  plugins: [TanStackRouterVite(), react(), glslify()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
