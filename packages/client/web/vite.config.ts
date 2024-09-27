import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const localServiceHost =
  process.env.RETROM_LOCAL_SERVICE_HOST || "http://localhost:5101";

// https://vitejs.dev/config/
export default defineConfig({
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
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
