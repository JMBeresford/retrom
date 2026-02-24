import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 4000,
    host: "0.0.0.0",
  },
  build: {
    target: ["es2022"],
  },
  plugins: [
    tailwindcss(),
    TanStackRouterVite({
      enableRouteGeneration: process.env.NODE_ENV === "development",
    }),
    react(),
    nxViteTsPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
