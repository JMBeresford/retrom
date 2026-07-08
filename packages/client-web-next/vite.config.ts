import { URL, fileURLToPath } from "node:url";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const serviceHostname = process.env.VITE_RETROM_HOSTNAME || "http://localhost";
const servicePort = process.env.VITE_RETROM_PORT || "5101";
const serviceHost = `${serviceHostname}:${servicePort}`;

const config = defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: serviceHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      enableRouteGeneration: mode === "development",
    }),
    viteReact(),
    nxViteTsPaths(),
  ],
}));

export default config;
