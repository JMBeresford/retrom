import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { glslify } from "vite-plugin-glslify";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import tailwindcss from "@tailwindcss/vite";

let localVersion = "0.0.0";
try {
  const { readLocalCargoToml } = await import("./src/lib/node-utils");
  const cargoTomlversion = readLocalCargoToml();
  localVersion = cargoTomlversion;
} catch (e) {
  if (process.env.NODE_ENV === "development") {
    console.error("Failed to read local Cargo.toml version:", e);
  }
}

export default defineConfig(({ mode }) => {
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  };

  const localServicePort = "5101";
  const localServiceHostname = "http://localhost";

  const localServiceHost =
    process.env.VITE_RETROM_LOCAL_SERVICE_HOST ||
    process.env.RETROM_LOCAL_SERVICE_HOST ||
    `${localServiceHostname}:${localServicePort}`;

  const localTracesEndpoint =
    process.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT ||
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318";

  const uptraceDsn =
    process.env.VITE_UPTRACE_DSN || process.env.UPTRACE_DSN || "";

  if (process.env.VITE_IS_DESKTOP) {
    console.log("Using desktop environment configuration");
  }

  // https://vitejs.dev/config/
  return {
    define: {
      "import.meta.env.VITE_UPTRACE_DSN": JSON.stringify(uptraceDsn),
      "import.meta.env.VITE_RETROM_VERSION": JSON.stringify(localVersion),
      "import.meta.env.VITE_RETROM_LOCAL_SERVICE_HOST":
        JSON.stringify(localServiceHost),
      "import.meta.env.VITE_RETROM_LOCAL_SERVICE_PORT":
        JSON.stringify(localServicePort),
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: localServiceHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/v1/traces": {
          target: localTracesEndpoint,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
      host: "0.0.0.0",
      allowedHosts: true,
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
    plugins: [
      tailwindcss(),
      TanStackRouterVite(),
      react(),
      glslify(),
      nxViteTsPaths(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
